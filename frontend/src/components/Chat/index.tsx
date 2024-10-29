import { Box, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
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

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const match = useMatch();
  const auth = useAuth();

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

    return () => {
      communicationSocket.off(CommunicationEvents.USER_JOINED);
      communicationSocket.off(CommunicationEvents.TEXT_MESSAGE_RECEIVED);
    };
  }, []);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "auto",
      }}
    >
      <Box sx={{ overflow: "auto", flex: 3 }}>
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
              sx={(theme) => ({
                display: "flex",
                justifyContent: "flex-end",
                margin: theme.spacing(2),
              })}
            >
              <Typography
                sx={(theme) => ({
                  background: theme.palette.primary.main,
                  padding: theme.spacing(1),
                  borderRadius: theme.spacing(2),
                  maxWidth: "80%",
                })}
              >
                {msg.message}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={(theme) => ({
                display: "flex",
                justifyContent: "flex-start",
                margin: theme.spacing(2),
                maxWidth: "80%",
              })}
            >
              <Typography
                sx={(theme) => ({
                  background: theme.palette.secondary.main,
                  padding: theme.spacing(1),
                  borderRadius: theme.spacing(2),
                })}
              >
                {msg.message}
              </Typography>
            </Box>
          )
        )}
      </Box>
      <Box
        sx={{ flex: 1, display: "flex", alignItems: "flex-end", zIndex: 10 }}
      >
        <TextField
          placeholder="Type message..."
          margin="normal"
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              communicationSocket.emit(CommunicationEvents.SEND_TEXT_MESSAGE, {
                roomId: getMatchId(),
                message: inputValue,
                username: user?.username,
                createdTime: Date.now(),
              });
              setInputValue("");
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default Chat;
