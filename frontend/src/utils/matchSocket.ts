import { io } from "socket.io-client";
import { getToken } from "./token";

const getMatchSocketUrl = () => {
  return import.meta.env.VITE_MATCH_SERVICE_URL ?? "http://localhost:3002";
};

const MATCH_SOCKET_URL = getMatchSocketUrl();

export const matchSocket = io(MATCH_SOCKET_URL, {
  reconnectionAttempts: 3,
  autoConnect: false,
  auth: {
    token: getToken(),
  },
});
