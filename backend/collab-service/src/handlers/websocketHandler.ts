import { Socket } from "socket.io";
import { io } from "../server";
import redisClient from "../config/redis";
import { Doc, Text, applyUpdate, encodeStateAsUpdate } from "yjs";

enum CollabEvents {
  // Receive
  JOIN = "join",
  LEAVE = "leave",
  DISCONNECT = "disconnect",
  INIT_DOCUMENT = "init_document",
  UPDATE_REQUEST = "update_request",
  UPDATE_CURSOR_REQUEST = "update_cursor_request",

  // Send
  ROOM_FULL = "room_full",
  USER_CONNECTED = "user_connected",
  NEW_USER_CONNECTED = "new_user_connected",
  PARTNER_LEFT = "partner_left",
  PARTNER_DISCONNECTED = "partner_disconnected",
  SYNC = "sync",
  UPDATE = "update",
  UPDATE_CURSOR = "update_cursor",
}

// interface CollabSession {
//   doc: Doc;
//   areBothUsersConnected: boolean;
// }

const EXPIRY_TIME = 3600;

const collabSessions = new Map<string, Doc>();
const roomReadiness = new Map<string, boolean>();

const CONNECTION_DELAY = 3000; // time window to allow for page re-renders / refresh
const userConnections = new Map<string, NodeJS.Timeout | null>();

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
      socket.emit(CollabEvents.ROOM_FULL);
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;

    if (
      io.sockets.adapter.rooms.get(roomId)?.size === 2 &&
      !collabSessions.has(roomId)
    ) {
      console.log("create collab session: ", roomId);

      const doc = new Doc();
      doc.on(CollabEvents.UPDATE, (update) => {
        console.log("server doc updated: ", roomId);
        io.to(roomId).emit(CollabEvents.UPDATE, update);
      });

      collabSessions.set(roomId, doc);
      roomReadiness.set(roomId, false);

      io.to(roomId).emit(CollabEvents.SYNC);
    }
  });

  socket.on(CollabEvents.INIT_DOCUMENT, (roomId: string, template: string) => {
    let doc = collabSessions.get(roomId);
    if (!doc) {
      doc = new Doc();
    }

    const isPartnerReady = roomReadiness.get(roomId);
    console.log("partner ready: ", isPartnerReady);
    console.log("doc: ", doc.getText().length);
    if (isPartnerReady && doc.getText().length === 0) {
      console.log("insert template");
      doc.getText().insert(0, template);
    } else {
      roomReadiness.set(roomId, true);
    }
  });

  socket.on(
    CollabEvents.UPDATE_REQUEST,
    (roomId: string, update: Uint8Array) => {
      let doc = collabSessions.get(roomId);
      if (!doc) {
        doc = new Doc();
      }
      applyUpdate(doc, update);

      // socket.to(roomId).emit(CollabEvents.UPDATE, update);
      // socket.to(roomId).emit(CollabEvents.UPDATE, encodeStateAsUpdate(doc));
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
        console.log("delete collab session: ", roomId);
        collabSessions.get(roomId)?.destroy();
        collabSessions.delete(roomId);
        roomReadiness.delete(roomId);
      }
    }, CONNECTION_DELAY);

    userConnections.set(connectionKey, connectionTimeout);
  });
};
