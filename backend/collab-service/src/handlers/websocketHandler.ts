import { Socket } from "socket.io";
import { io } from "../server";
import redisClient from "../config/redis";

enum CollabEvents {
  // Receive
  JOIN = "join",
  CHANGE = "change",
  LEAVE = "leave",
  DISCONNECT = "disconnect",

  // Send
  ROOM_FULL = "room_full",
  CONNECTED = "connected",
  NEW_USER_CONNECTED = "new_user_connected",
  CODE_CHANGE = "code_change",
  PARTNER_LEFT = "partner_left",
  PARTNER_DISCONNECTED = "partner_disconnected",
}

const EXPIRY_TIME = 3600;

export const handleWebsocketCollabEvents = (socket: Socket) => {
  socket.on(CollabEvents.JOIN, async ({ roomId }) => {
    if (!roomId) {
      return;
    }

    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size >= 2) {
      socket.emit(CollabEvents.ROOM_FULL);
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;

    // in case of disconnect, send the code to the user when he rejoins
    const code = await redisClient.get(`collaboration:${roomId}`);
    socket.emit(CollabEvents.CONNECTED, { code: code ? code : "" });

    // inform the other user that a new user has joined
    socket.to(roomId).emit(CollabEvents.NEW_USER_CONNECTED);
  });

  socket.on(CollabEvents.CHANGE, async ({ roomId, code }) => {
    if (!roomId || !code) {
      return;
    }

    await redisClient.set(`collaboration:${roomId}`, code, {
      EX: EXPIRY_TIME,
    });
    socket.to(roomId).emit(CollabEvents.CODE_CHANGE, { code });
  });

  socket.on(CollabEvents.LEAVE, ({ roomId }) => {
    if (!roomId) {
      return;
    }

    socket.leave(roomId);
    socket.to(roomId).emit(CollabEvents.PARTNER_LEFT);
  });

  socket.on(CollabEvents.DISCONNECT, () => {
    const { roomId } = socket.data;
    if (roomId) {
      socket.to(roomId).emit(CollabEvents.PARTNER_DISCONNECTED);
    }
  });
};
