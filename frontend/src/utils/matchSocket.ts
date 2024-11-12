import { io } from "socket.io-client";
import { getToken } from "./token";

const MATCH_SOCKET_URL =
  import.meta.env.VITE_MATCH_SERVICE_URL ?? "http://localhost:3002";

export const createMatchSocket = () =>
  io(MATCH_SOCKET_URL, {
    reconnectionAttempts: 3,
    autoConnect: false,
    auth: {
      token: getToken(),
    },
  });
