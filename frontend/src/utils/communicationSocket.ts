import { io } from "socket.io-client";

const COMMUNICATION_SOCKET_URL = "http://localhost:3005";

export const communicationSocket = io(COMMUNICATION_SOCKET_URL, {
  reconnectionAttempts: 3,
  autoConnect: false,
});
