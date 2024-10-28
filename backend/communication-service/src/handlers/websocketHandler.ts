import { Socket } from "socket.io";
import { CommunicationEvents } from "../utils/types";
import { BOT_NAME } from "../utils/constants";
import { io } from "../server";

export const handleWebsocketCommunicationEvents = (socket: Socket) => {
  socket.on(
    CommunicationEvents.JOIN,
    async ({ roomId, username }: { roomId: string; username: string }) => {
      if (!roomId) {
        return;
      }

      socket.join(roomId);
      socket.data.roomId = roomId;

      // send the message to all users (including the sender) in the room
      const createdTime = Date.now();
      io.to(roomId).emit(CommunicationEvents.USER_JOINED, {
        from: BOT_NAME,
        message: `${username} has joined the chat`,
        createdTime,
      });
    }
  );

  socket.on(
    CommunicationEvents.LEAVE,
    ({ roomId, username }: { roomId: string; username: string }) => {
      if (!roomId) {
        return;
      }

      socket.leave(roomId);
      const createdTime = Date.now();
      socket.to(roomId).emit(CommunicationEvents.LEAVE, {
        from: BOT_NAME,
        message: `${username} has left the chat`,
        createdTime,
      });
    }
  );

  socket.on(
    CommunicationEvents.SEND_TEXT_MESSAGE,
    ({
      roomId,
      message,
      username,
      createdTime,
    }: {
      roomId: string;
      message: string;
      username: string;
      createdTime: number;
    }) => {
      // send the message to all users (including the sender) in the room
      io.to(roomId).emit(CommunicationEvents.TEXT_MESSAGE_RECEIVED, {
        from: username,
        message,
        createdTime,
      });
    }
  );

  socket.on(CommunicationEvents.DISCONNECT, () => {
    const { roomId } = socket.data;
    if (roomId) {
      socket.to(roomId).emit(CommunicationEvents.DISCONNECTED);
    }
  });
};
