import { io } from "socket.io-client";
import { getToken } from "./token";

export enum CommunicationEvents {
  // send
  JOIN = "join",
  USER_DISCONNECT = "user_disconnect",
  SEND_TEXT_MESSAGE = "send_text_message",
  DISCONNECT = "disconnect",

  // receive
  USER_JOINED = "user_joined",
  ALREADY_JOINED = "already_joined",
  TEXT_MESSAGE_RECEIVED = "text_message_received",
  CONNECT_ERROR = "connect_error",
  DISCONNECTED = "disconnected",
}

const getCommunicationSocketUrl = () => {
  return import.meta.env.VITE_COMM_SERVICE_URL ?? "http://localhost:3005";
};

const COMMUNICATION_SOCKET_URL = getCommunicationSocketUrl();

export const createCommunicationSocket = () =>
  io(COMMUNICATION_SOCKET_URL, {
    reconnectionAttempts: 3,
    autoConnect: false,
    withCredentials: true,
    auth: {
      token: getToken(),
    },
  });
