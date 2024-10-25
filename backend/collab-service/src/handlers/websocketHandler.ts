import { Socket } from "socket.io";
import { io } from "../../server";
import redisClient from "../../config/redis";

enum CollabEvents {
  // Receive
  JOIN = "join",
  CHANGE = "change",
  LEAVE = "leave",
  DISCONNECT = "disconnect",

  // Send
  ROOM_FULL = "room_full",
  CONNECTED = "connected",
  CODE_CHANGE = "code_change",
  LEFT = "left",
  DISCONNECTED = "disconnected",
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

    // in case of disconnect, send the code to the user when rejoin
    const code = await redisClient.get(`collaboration:${roomId}`);
    if (code) {
      io.to(roomId).emit(CollabEvents.CONNECTED, { code });
    } else {
      io.to(roomId).emit(CollabEvents.CONNECTED);
    }
  });

  socket.on(CollabEvents.CHANGE, async ({ roomId, code }) => {
    if (!roomId || !code) {
      return;
    }

    await redisClient.set(`collaboration:${roomId}`, code, {
      EX: EXPIRY_TIME,
    });
    io.to(roomId).emit(CollabEvents.CODE_CHANGE, { code });
  });

  socket.on(CollabEvents.LEAVE, ({ roomId }) => {
    if (!roomId) {
      return;
    }

    socket.leave(roomId);
    socket.to(roomId).emit(CollabEvents.LEFT);
  });

  socket.on(CollabEvents.DISCONNECT, () => {
    const { roomId } = socket.data;
    if (roomId) {
      socket.to(roomId).emit(CollabEvents.DISCONNECTED);
    }
  });
};
