import { io } from "socket.io-client";
import { getToken } from "./token";

export enum MatchEvents {
  // Send
  MATCH_REQUEST = "match_request",
  MATCH_CANCEL_REQUEST = "match_cancel_request",
  MATCH_ACCEPT_REQUEST = "match_accept_request",
  MATCH_DECLINE_REQUEST = "match_decline_request",
  REMATCH_REQUEST = "rematch_request",
  MATCH_END_REQUEST = "match_end_request",

  USER_CONNECTED = "user_connected",
  USER_DISCONNECTED = "user_disconnected",

  // Receive
  MATCH_FOUND = "match_found",
  MATCH_SUCCESSFUL = "match_successful",
  MATCH_UNSUCCESSFUL = "match_unsuccessful",
  MATCH_REQUEST_EXISTS = "match_request_exists",
  MATCH_REQUEST_ERROR = "match_request_error",

  SOCKET_DISCONNECT = "disconnect",
  SOCKET_CLIENT_DISCONNECT = "io client disconnect",
  SOCKET_SERVER_DISCONNECT = "io server disconnect",
  SOCKET_RECONNECT_SUCCESS = "reconnect",
  SOCKET_RECONNECT_FAILED = "reconnect_failed",
}

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
