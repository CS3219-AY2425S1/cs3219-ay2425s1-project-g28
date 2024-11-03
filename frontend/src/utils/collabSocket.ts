import { EditorView } from "@codemirror/view";
import { io } from "socket.io-client";
import { updateCursor, Cursor } from "./collabCursor";
import { Doc, Text, applyUpdateV2 } from "yjs";
import { Awareness } from "y-protocols/awareness";

enum CollabEvents {
  // Send
  JOIN = "join",
  LEAVE = "leave",
  INIT_DOCUMENT = "init_document",
  UPDATE_REQUEST = "update_request",
  UPDATE_CURSOR_REQUEST = "update_cursor_request",

  // Receive
  ROOM_READY = "room_ready",
  UPDATE = "updateV2",
  UPDATE_CURSOR = "update_cursor",
}

export type CollabSessionData = {
  ready: boolean;
  text: Text;
  awareness: Awareness;
};

const COLLAB_SOCKET_URL = "http://localhost:3003";
const collabSocket = io(COLLAB_SOCKET_URL, {
  reconnectionAttempts: 3,
  autoConnect: false,
});

let doc: Doc;
let text: Text;
let awareness: Awareness;

export const join = (
  uid: string,
  roomId: string
): Promise<CollabSessionData> => {
  collabSocket.connect();

  doc = new Doc();
  text = doc.getText();
  awareness = new Awareness(doc);

  doc.on(CollabEvents.UPDATE, (update, origin) => {
    if (origin != uid) {
      console.log("client sent update");
      collabSocket.emit(CollabEvents.UPDATE_REQUEST, roomId, update);
    }
  });

  collabSocket.on(CollabEvents.UPDATE, (update) => {
    console.log("client received update");
    applyUpdateV2(doc, new Uint8Array(update), uid);
  });

  collabSocket.emit(CollabEvents.JOIN, uid, roomId);
  console.log("join: ", roomId);

  return new Promise((resolve) => {
    collabSocket.once(CollabEvents.ROOM_READY, (ready: boolean) => {
      console.log("room ready: ", ready);
      resolve({ ready: ready, text: text, awareness: awareness });
    });
  });
};

export const initDocument = (roomId: string, template: string) => {
  collabSocket.emit(CollabEvents.INIT_DOCUMENT, roomId, template);
};

export const leave = (uid: string, roomId: string) => {
  console.log("leave: ", roomId);
  collabSocket.off(CollabEvents.UPDATE);
  collabSocket.emit(CollabEvents.LEAVE, uid, roomId);
  doc.destroy();
};

export const sendCursorUpdate = (roomId: string, cursor: Cursor) => {
  collabSocket.emit(CollabEvents.UPDATE_CURSOR_REQUEST, roomId, cursor);
};

export const receiveCursorUpdate = (view: EditorView) => {
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
