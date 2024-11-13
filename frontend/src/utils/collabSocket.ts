import { io } from "socket.io-client";
import { getToken } from "./token";

export enum CollabEvents {
  // Send
  JOIN = "join",
  LEAVE = "leave",
  INIT_DOCUMENT = "init_document",
  UPDATE_REQUEST = "update_request",
  UPDATE_CURSOR_REQUEST = "update_cursor_request",
  RECONNECT_REQUEST = "reconnect_request",
  END_SESSION_REQUEST = "end_session_request",

  // Receive
  ROOM_READY = "room_ready",
  DOCUMENT_READY = "document_ready",
  DOCUMENT_NOT_FOUND = "document_not_found",
  UPDATE = "updateV2",
  UPDATE_CURSOR = "update_cursor",
  END_SESSION = "end_session",
  PARTNER_DISCONNECTED = "partner_disconnected",

  SOCKET_DISCONNECT = "disconnect",
  SOCKET_CLIENT_DISCONNECT = "io client disconnect",
  SOCKET_SERVER_DISCONNECT = "io server disconnect",
  SOCKET_RECONNECT_SUCCESS = "reconnect",
  SOCKET_RECONNECT_FAILED = "reconnect_failed",
}

const getCollabSocketUrl = () => {
  return import.meta.env.VITE_COLLAB_SERVICE_URL ?? "http://localhost:3003";
};

const COLLAB_SOCKET_URL = getCollabSocketUrl();

export const createCollabSocket = () =>
  io(COLLAB_SOCKET_URL, {
    reconnectionAttempts: 5,
    autoConnect: false,
    auth: {
      token: getToken(),
    },
  });
