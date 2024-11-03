import { Socket } from "socket.io";
import { io } from "../server";
import redisClient from "../config/redis";
import { Doc, applyUpdateV2, encodeStateAsUpdateV2 } from "yjs";

enum CollabEvents {
  // Receive
  JOIN = "join",
  LEAVE = "leave",
  DISCONNECT = "disconnect",
  INIT_DOCUMENT = "init_document",
  UPDATE_REQUEST = "update_request",
  UPDATE_CURSOR_REQUEST = "update_cursor_request",
  RECONNECT_REQUEST = "reconnect_request",

  // Send
  ROOM_READY = "room_ready",
  UPDATE = "updateV2",
  UPDATE_CURSOR = "update_cursor",
}

const EXPIRY_TIME = 3600;
const CONNECTION_DELAY = 3000; // time window to allow for page re-renders / refresh

const userConnections = new Map<string, NodeJS.Timeout | null>();
const collabSessions = new Map<string, Doc>();
const partnerReadiness = new Map<string, boolean>();

export const handleWebsocketCollabEvents = (socket: Socket) => {
  socket.on(CollabEvents.JOIN, async (uid: string, roomId: string) => {
    const connectionKey = `${uid}:${roomId}`;
    if (userConnections.has(connectionKey)) {
      clearTimeout(userConnections.get(connectionKey)!);
      return;
    }
    userConnections.set(connectionKey, null);

    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room?.size >= 2) {
      socket.emit(CollabEvents.ROOM_READY, false);
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;

    if (
      io.sockets.adapter.rooms.get(roomId)?.size === 2 &&
      !collabSessions.has(roomId)
    ) {
      createCollabSession(roomId);
      io.to(roomId).emit(CollabEvents.ROOM_READY, true);
    }
  });

  socket.on(CollabEvents.INIT_DOCUMENT, (roomId: string, template: string) => {
    const doc = getDocument(roomId);
    const isPartnerReady = partnerReadiness.get(roomId);

    if (isPartnerReady && doc.getText().length === 0) {
      doc.getText().insert(0, template);
    } else {
      partnerReadiness.set(roomId, true);
    }
  });

  socket.on(
    CollabEvents.UPDATE_REQUEST,
    (roomId: string, update: Uint8Array) => {
      const doc = collabSessions.get(roomId);
      if (doc) {
        applyUpdateV2(doc, new Uint8Array(update));
      } else {
        // TODO: error handling
      }
    }
  );

  socket.on(
    CollabEvents.UPDATE_CURSOR_REQUEST,
    (
      roomId: string,
      cursor: { uid: string; username: string; from: number; to: number }
    ) => {
      socket.to(roomId).emit(CollabEvents.UPDATE_CURSOR, cursor);
    }
  );

  socket.on(CollabEvents.LEAVE, (uid: string, roomId: string) => {
    const connectionKey = `${uid}:${roomId}`;
    if (!userConnections.has(connectionKey)) {
      return;
    }

    clearTimeout(userConnections.get(connectionKey)!);

    const connectionTimeout = setTimeout(() => {
      userConnections.delete(connectionKey);
      socket.leave(roomId);
      socket.disconnect();

      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room || room.size === 0) {
        removeCollabSession(roomId);
      }
    }, CONNECTION_DELAY);

    userConnections.set(connectionKey, connectionTimeout);
  });

  socket.on(CollabEvents.RECONNECT_REQUEST, async (roomId: string) => {
    // TODO: Handle recconnection
    socket.join(roomId);

    const doc = getDocument(roomId);
    const storeData = await redisClient.get(`collaboration:${roomId}`);

    if (storeData) {
      const tempDoc = new Doc();
      const update = Buffer.from(storeData, "base64");
      applyUpdateV2(tempDoc, new Uint8Array(update));
      const tempText = tempDoc.getText().toString();

      const text = doc.getText();
      doc.transact(() => {
        text.delete(0, text.length);
        text.insert(0, tempText);
      });
    }
  });
};

const createCollabSession = (roomId: string) => {
  console.log("set up collab session: ", roomId);
  getDocument(roomId);
  partnerReadiness.set(roomId, false);
};

const removeCollabSession = (roomId: string) => {
  console.log("delete collab session: ", roomId);
  collabSessions.get(roomId)?.destroy();
  collabSessions.delete(roomId);
  partnerReadiness.delete(roomId);
};

const getDocument = (roomId: string) => {
  let doc = collabSessions.get(roomId);
  if (!doc) {
    doc = new Doc();
    doc.on(CollabEvents.UPDATE, (_update) => {
      console.log("server doc updated: ", roomId);
      saveDocument(roomId, doc!);
      io.to(roomId).emit(CollabEvents.UPDATE, encodeStateAsUpdateV2(doc!));
    });
    collabSessions.set(roomId, doc);
  }

  return doc;
};

const saveDocument = async (roomId: string, doc: Doc) => {
  const docState = encodeStateAsUpdateV2(doc);
  const docAsString = Buffer.from(docState).toString("base64");
  await redisClient.set(`collaboration:${roomId}`, docAsString, {
    EX: EXPIRY_TIME,
  });
};
