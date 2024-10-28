export enum CommunicationEvents {
  // receive
  JOIN = "join",
  LEAVE = "leave",
  SEND_TEXT_MESSAGE = "send_text_message",
  DISCONNECT = "disconnect",

  // send
  USER_LEFT = "user_left",
  USER_JOINED = "user_joined",
  TEXT_MESSAGE_RECEIVED = "text_message_received",
  DISCONNECTED = "disconnected",
}
