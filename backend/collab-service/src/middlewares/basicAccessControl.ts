import { ExtendedError, Socket } from "socket.io";
import { verifyToken } from "../api/userService.ts";

export const verifyUserToken = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const token =
    socket.handshake.headers.authorization || socket.handshake.auth.token;
  verifyToken(token)
    .then(() => {
      next();
    })
    .catch((err) => {
      console.error(err);
      next(new Error("Unauthorized"));
    });
};
