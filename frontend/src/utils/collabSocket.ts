import { EditorView } from "@codemirror/view";
// import { Text } from "@codemirror/state";
import { io } from "socket.io-client";
import { updateCursor, Cursor } from "./collabCursor";
import { Doc, Text, applyUpdate } from "yjs";
import { Awareness } from "y-protocols/awareness";

// Adapted from https://codemirror.net/examples/collab/ and https://github.com/BjornTheProgrammer/react-codemirror-collab-sockets

enum CollabEvents {
  // Send
  JOIN = "join",
  LEAVE = "leave",
  UPDATE_REQUEST = "update_request",
  UPDATE_CURSOR_REQUEST = "update_cursor_request",

  // Receive
  USER_CONNECTED = "user_connected",
  SYNC = "sync",
  UPDATE = "update",
  UPDATE_CURSOR = "update_cursor",
}

const COLLAB_SOCKET_URL = "http://localhost:3003";
const collabSocket = io(COLLAB_SOCKET_URL, {
  reconnectionAttempts: 3,
  autoConnect: false,
});

export const join = (
  roomId: string
): Promise<{ text: Text; awareness: Awareness }> => {
  collabSocket.connect();
  collabSocket.emit(CollabEvents.JOIN, roomId);

  const doc = new Doc();
  const text = doc.getText("codemirror");
  const awareness = new Awareness(doc);

  doc.on(CollabEvents.UPDATE, (update) => {
    collabSocket.emit(CollabEvents.UPDATE_REQUEST, roomId, update);
  });

  collabSocket.on(CollabEvents.UPDATE, (update) => {
    applyUpdate(doc, new Uint8Array(update));
  });

  return new Promise((resolve) => {
    collabSocket.once(CollabEvents.SYNC, (update) => {
      applyUpdate(doc, new Uint8Array(update));
      resolve({ text: text, awareness: awareness });
    });
  });
};

export const leave = (roomId: string) => {
  collabSocket.emit(CollabEvents.LEAVE, roomId);
  collabSocket.disconnect();
};

export const sendCursorUpdates = (roomId: string, cursor: Cursor) => {
  collabSocket.emit(CollabEvents.UPDATE_CURSOR_REQUEST, roomId, cursor);
};

export const receiveCursorUpdates = (view: EditorView) => {
  if (collabSocket.hasListeners(CollabEvents.UPDATE_CURSOR)) {
    return;
  }

  collabSocket.on(CollabEvents.UPDATE_CURSOR, (cursor: Cursor) => {
    view.dispatch({
      effects: updateCursor.of(cursor),
    });
  });
};

export const removeCursorListener = () => {
  collabSocket.off(CollabEvents.UPDATE_CURSOR);
};
