import { Socket } from "socket.io";
import { io } from "../server";
import redisClient from "../config/redis";
import { Doc, applyUpdateV2, encodeStateAsUpdateV2 } from "yjs";
import { createQuestionHistory } from "../api/questionHistoryService";

enum CollabEvents {
  // Receive
  JOIN = "join",
  LEAVE = "leave",
  DISCONNECT = "disconnect",
  INIT_DOCUMENT = "init_document",
  UPDATE_REQUEST = "update_request",
  UPDATE_CURSOR_REQUEST = "update_cursor_request",
  RECONNECT_REQUEST = "reconnect_request",
  END_SESSION_REQUEST = "end_session_request",

  // Send
  ROOM_READY = "room_ready",
  DOCUMENT_READY = "document_ready",
  UPDATE = "updateV2",
  UPDATE_CURSOR = "update_cursor",
  END_SESSION = "end_session",
  PARTNER_DISCONNECTED = "partner_disconnected",
}

const EXPIRY_TIME = 3600;
const CONNECTION_DELAY = 3000; // time window to allow for page re-renders

const userConnections = new Map<string, NodeJS.Timeout | null>();
const collabSessions = new Map<string, Doc>();
const partnerReadiness = new Map<string, boolean>();

export const handleWebsocketCollabEvents = (socket: Socket) => {
  socket.on(CollabEvents.JOIN, (uid: string, roomId: string) => {
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

  socket.on(
    CollabEvents.INIT_DOCUMENT,
    (
      roomId: string,
      template: string,
      uid1: string,
      uid2: string,
      language: string,
      qnId: string,
      qnTitle: string
    ) => {
      const doc = getDocument(roomId);
      const isPartnerReady = partnerReadiness.get(roomId);

      if (isPartnerReady && doc.getText().length === 0) {
        const token =
          socket.handshake.headers.authorization || socket.handshake.auth.token;
        createQuestionHistory(
          [uid1, uid2],
          qnId,
          qnTitle,
          "Attempted",
          template,
          language,
          token
        )
          .then((res) => {
            doc.transact(() => {
              doc.getText().insert(0, template);
            });
            io.to(roomId).emit(
              CollabEvents.DOCUMENT_READY,
              res.data.qnHistory.id
            );
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        partnerReadiness.set(roomId, true);
      }
    }
  );

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

  socket.on(
    CollabEvents.LEAVE,
    (uid: string, roomId: string, isPartnerNotified: boolean) => {
      const connectionKey = `${uid}:${roomId}`;
      if (userConnections.has(connectionKey)) {
        clearTimeout(userConnections.get(connectionKey)!);
      }

      if (isPartnerNotified) {
        handleUserLeave(uid, roomId, socket);
        return;
      }

      const connectionTimeout = setTimeout(() => {
        handleUserLeave(uid, roomId, socket);
        io.to(roomId).emit(CollabEvents.PARTNER_DISCONNECTED);
      }, CONNECTION_DELAY);

      userConnections.set(connectionKey, connectionTimeout);
    }
  );

  socket.on(
    CollabEvents.END_SESSION_REQUEST,
    (roomId: string, sessionDuration: number) => {
      socket.to(roomId).emit(CollabEvents.END_SESSION, sessionDuration);
    }
  );

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
  getDocument(roomId);
  partnerReadiness.set(roomId, false);
};

const removeCollabSession = (roomId: string) => {
  collabSessions.get(roomId)?.destroy();
  collabSessions.delete(roomId);
  partnerReadiness.delete(roomId);
  redisClient.del(roomId);
};

const getDocument = (roomId: string) => {
  let doc = collabSessions.get(roomId);
  if (!doc) {
    doc = new Doc();
    doc.on(CollabEvents.UPDATE, () => {
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

const handleUserLeave = (uid: string, roomId: string, socket: Socket) => {
  const connectionKey = `${uid}:${roomId}`;
  userConnections.delete(connectionKey);

  socket.leave(roomId);
  socket.disconnect();

  removeCollabSession(roomId);
};
