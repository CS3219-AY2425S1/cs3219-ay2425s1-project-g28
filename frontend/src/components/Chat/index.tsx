import { Box, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { communicationSocket } from "../../utils/communicationSocket";
import { useMatch } from "../../contexts/MatchContext";
import {
  USE_AUTH_ERROR_MESSAGE,
  USE_MATCH_ERROR_MESSAGE,
} from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";

type Message = {
  from: string;
  type: "user_generated" | "bot_generated";
  message: string;
  createdTime: number;
};

enum CommunicationEvents {
  // receive
  JOIN = "join",
  LEAVE = "leave",
  SEND_TEXT_MESSAGE = "send_text_message",
  DISCONNECT = "disconnect",

  // send
  USER_LEFT = "user_left",
  USER_JOINED = "user_joined",
  ALREADY_JOINED = "already_joined",
  TEXT_MESSAGE_RECEIVED = "text_message_received",
  DISCONNECTED = "disconnected",
}

type ChatProps = {
  isActive: boolean;
};

const Chat: React.FC<ChatProps> = ({ isActive }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const match = useMatch();
  const auth = useAuth();
  const messagesRef = useRef<HTMLDivElement>(null);

  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }

  if (!auth) {
    throw new Error(USE_AUTH_ERROR_MESSAGE);
  }

  const { getMatchId } = match;
  const { user } = auth;

  useEffect(() => {
    // join the room automatically when this loads
    communicationSocket.open();
    // to make sure this does not run twice
    communicationSocket.emit(CommunicationEvents.JOIN, {
      roomId: getMatchId(),
      username: user?.username,
    });
    // joinedRef.current = true;
  }, []);

  useEffect(() => {
    // initliase listerner for incoming messages
    communicationSocket.on(
      CommunicationEvents.USER_JOINED,
      (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    );
    communicationSocket.on(
      CommunicationEvents.TEXT_MESSAGE_RECEIVED,
      (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    );
    communicationSocket.on(
      CommunicationEvents.DISCONNECTED,
      (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    );

    return () => {
      communicationSocket.off(CommunicationEvents.USER_JOINED);
      communicationSocket.off(CommunicationEvents.TEXT_MESSAGE_RECEIVED);
    };
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      const nodes = messagesRef.current.querySelectorAll("div > div");
      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        lastNode.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, isActive]);

  return (
    <>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          padding: 2,
        }}
        ref={messagesRef}
      >
        {messages.map((msg, id) =>
          msg.type === "bot_generated" ? (
            <Box
              key={id}
              sx={(theme) => ({
                display: "flex",
                justifyContent: "center",
                margin: theme.spacing(1, 0),
              })}
            >
              <Typography
                sx={(theme) => ({
                  width: "fit-content",
                  color: theme.palette.secondary.contrastText,
                  background: theme.palette.secondary.main,
                  padding: theme.spacing(0.5, 1),
                  borderRadius: theme.spacing(1),
                  fontSize: "12px",
                  fontWeight: "bold",
                })}
              >
                {msg.message}
              </Typography>
            </Box>
          ) : msg.from === user?.username ? (
            <Box
              key={id}
              sx={(theme) => ({
                display: "flex",
                justifyContent: "flex-end",
                marginTop: theme.spacing(1),
              })}
            >
              <Typography
                sx={(theme) => ({
                  background: theme.palette.primary.main,
                  padding: theme.spacing(1, 2),
                  borderRadius: theme.spacing(2),
                  maxWidth: "80%",
                })}
              >
                {msg.message}
              </Typography>
            </Box>
          ) : (
            <Box
              key={id}
              sx={(theme) => ({
                display: "flex",
                justifyContent: "flex-start",
                marginTop: theme.spacing(1),
              })}
            >
              <Typography
                sx={(theme) => ({
                  background: theme.palette.secondary.main,
                  padding: theme.spacing(1, 2),
                  borderRadius: theme.spacing(2),
                  maxWidth: "80%",
                })}
              >
                {msg.message}
              </Typography>
            </Box>
          )
        )}
      </Box>
      {/* <div ref={messagesRef} /> */}
      <TextField
        placeholder="Type message..."
        margin="none"
        multiline
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          const trimmedValue = inputValue.trim();
          if (e.key === "Enter" && trimmedValue !== "") {
            e.preventDefault();
            communicationSocket.emit(CommunicationEvents.SEND_TEXT_MESSAGE, {
              roomId: getMatchId(),
              message: trimmedValue,
              username: user?.username,
              createdTime: Date.now(),
            });
            setInputValue("");
          }
        }}
        sx={(theme) => ({
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          background: "white",
          paddingBottom: theme.spacing(4),
        })}
      />
    </>
  );
};

export default Chat;
