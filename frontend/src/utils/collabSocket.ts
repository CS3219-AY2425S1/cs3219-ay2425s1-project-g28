import { io } from "socket.io-client";
import { getToken } from "./token";

const COLLAB_SOCKET_URL =
  import.meta.env.VITE_COLLAB_SERVICE_URL ?? "http://localhost:3003";

export const createCollabSocket = () =>
  io(COLLAB_SOCKET_URL, {
    reconnectionAttempts: 5,
    autoConnect: false,
    auth: {
      token: getToken(),
    },
  });
