import { io } from "socket.io-client";

const MATCH_SOCKET_URL =
  import.meta.env.VITE_MATCH_SERVICE_URL ?? "http://localhost:3002";

export const matchSocket = io(MATCH_SOCKET_URL, {
  reconnectionAttempts: 3,
  autoConnect: false,
  auth: {
    token: `Bearer ${localStorage.getItem("token")}`,
  },
});
