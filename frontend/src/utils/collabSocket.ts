import { EditorView } from "@codemirror/view";
import { io } from "socket.io-client";
import { updateCursor, Cursor } from "./collabCursor";
import { Doc, Text, applyUpdateV2 } from "yjs";
import { Awareness } from "y-protocols/awareness";
import { getToken } from "./token";

export enum CollabEvents {
  // Send
  JOIN = "join",
  LEAVE = "leave",
  INIT_DOCUMENT = "init_document",
  UPDATE_REQUEST = "update_request",
  UPDATE_CURSOR_REQUEST = "update_cursor_request",
  RECONNECT_REQUEST = "reconnect_request",
  END_SESSION_REQUEST = "end_session_request",

  // Receive
  ROOM_READY = "room_ready",
  DOCUMENT_READY = "document_ready",
  UPDATE = "updateV2",
  UPDATE_CURSOR = "update_cursor",
  END_SESSION = "end_session",
  PARTNER_DISCONNECTED = "partner_disconnected",
  SOCKET_DISCONNECT = "disconnect",
  SOCKET_CLIENT_DISCONNECT = "io client disconnect",
  SOCKET_SERVER_DISCONNECT = "io server disconnect",
  SOCKET_RECONNECT_SUCCESS = "reconnect",
  SOCKET_RECONNECT_FAILED = "reconnect_failed",
}

export type CollabSessionData = {
  ready: boolean;
  text: Text;
  awareness: Awareness;
};

const COLLAB_SOCKET_URL = "http://localhost:3003";

export const collabSocket = io(COLLAB_SOCKET_URL, {
  reconnectionAttempts: 3,
  autoConnect: false,
  auth: {
    token: getToken(),
  },
});

let doc: Doc;
let text: Text;
let awareness: Awareness;

export const join = (
  uid: string,
  roomId: string
): Promise<CollabSessionData> => {
  collabSocket.connect();
  initConnectionStatusListeners(roomId);

  doc = new Doc();
  text = doc.getText();
  awareness = new Awareness(doc);

  doc.on(CollabEvents.UPDATE, (update, origin) => {
    if (origin != uid) {
      collabSocket.emit(CollabEvents.UPDATE_REQUEST, roomId, update);
    }
  });

  collabSocket.on(CollabEvents.UPDATE, (update) => {
    applyUpdateV2(doc, new Uint8Array(update), uid);
  });

  collabSocket.emit(CollabEvents.JOIN, uid, roomId);

  return new Promise((resolve) => {
    collabSocket.once(CollabEvents.ROOM_READY, (ready: boolean) => {
      resolve({ ready: ready, text: text, awareness: awareness });
    });
  });
};

export const initDocument = (uid: string, roomId: string, template: string) => {
  collabSocket.emit(CollabEvents.INIT_DOCUMENT, roomId, template);

  return new Promise<void>((resolve) => {
    collabSocket.once(CollabEvents.UPDATE, (update) => {
      applyUpdateV2(doc, new Uint8Array(update), uid);
      resolve();
    });
  });
};

export const leave = (
  uid: string,
  roomId: string,
  isPartnerNotified: boolean
) => {
  collabSocket.removeAllListeners();
  collabSocket.io.removeListener(CollabEvents.SOCKET_RECONNECT_SUCCESS);
  collabSocket.io.removeListener(CollabEvents.SOCKET_RECONNECT_FAILED);
  doc?.destroy();

  if (collabSocket.connected) {
    collabSocket.emit(CollabEvents.LEAVE, uid, roomId, isPartnerNotified);
  }
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

export const reconnectRequest = (roomId: string) => {
  collabSocket.emit(CollabEvents.RECONNECT_REQUEST, roomId);
};

const initConnectionStatusListeners = (roomId: string) => {
  if (!collabSocket.hasListeners(CollabEvents.SOCKET_DISCONNECT)) {
    collabSocket.on(CollabEvents.SOCKET_DISCONNECT, (reason) => {
      if (
        reason !== CollabEvents.SOCKET_CLIENT_DISCONNECT &&
        reason !== CollabEvents.SOCKET_SERVER_DISCONNECT
      ) {
        // TODO: Handle socket disconnection
      }
    });
  }

  if (!collabSocket.io.hasListeners(CollabEvents.SOCKET_RECONNECT_SUCCESS)) {
    collabSocket.io.on(CollabEvents.SOCKET_RECONNECT_SUCCESS, () => {
      console.log("reconnect request");
      collabSocket.emit(CollabEvents.RECONNECT_REQUEST, roomId);
    });
  }

  if (!collabSocket.io.hasListeners(CollabEvents.SOCKET_RECONNECT_FAILED)) {
    collabSocket.io.on(CollabEvents.SOCKET_RECONNECT_FAILED, () => {
      console.log("reconnect failed");
    });
  }
};
