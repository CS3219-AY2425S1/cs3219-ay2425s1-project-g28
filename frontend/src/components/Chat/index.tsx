import { Box, styled, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { CommunicationEvents } from "../../utils/communicationSocket";
import { USE_COLLAB_ERROR_MESSAGE } from "../../utils/constants";
import { toast } from "react-toastify";
import { useCollab } from "../../contexts/CollabContext";

type Message = {
  from: string;
  type: "user_generated" | "bot_generated";
  message: string;
  createdTime: number;
};

type ChatProps = {
  isActive: boolean;
  setHasNewMessage: React.Dispatch<React.SetStateAction<boolean>>;
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(2),
  maxWidth: "80%",
  whiteSpace: "pre-line",
  wordBreak: "break-word",
}));

const Chat: React.FC<ChatProps> = ({ isActive, setHasNewMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");

  const messagesRef = useRef<HTMLDivElement>(null);
  const errorHandledRef = useRef(false);

  const collab = useCollab();
  if (!collab) {
    throw new Error(USE_COLLAB_ERROR_MESSAGE);
  }
  const { communicationSocket, collabUser, roomId } = collab;

  useEffect(() => {
    // join the room automatically when this loads
    communicationSocket?.open();
    communicationSocket?.emit(CommunicationEvents.JOIN, {
      roomId: roomId,
      username: collabUser?.username,
    });

    return () => {
      communicationSocket?.emit(CommunicationEvents.USER_DISCONNECT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // initialize listener for incoming messages
    const listener = (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      setHasNewMessage(true);
    };
    const errorListener = () => {
      if (!errorHandledRef.current) {
        toast.error("Connection error. Please try again.");
        errorHandledRef.current = true;
      }
    };

    communicationSocket?.on(CommunicationEvents.USER_JOINED, listener);
    communicationSocket?.on(
      CommunicationEvents.TEXT_MESSAGE_RECEIVED,
      listener
    );
    communicationSocket?.on(CommunicationEvents.DISCONNECTED, listener);
    communicationSocket?.on(CommunicationEvents.CONNECT_ERROR, errorListener);

    return () => {
      communicationSocket?.off(CommunicationEvents.USER_JOINED, listener);
      communicationSocket?.off(
        CommunicationEvents.TEXT_MESSAGE_RECEIVED,
        listener
      );
      communicationSocket?.off(CommunicationEvents.DISCONNECTED, listener);
      communicationSocket?.off(
        CommunicationEvents.CONNECT_ERROR,
        errorListener
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          ) : msg.from === collabUser?.username ? (
            <Box
              key={id}
              sx={(theme) => ({
                display: "flex",
                justifyContent: "flex-end",
                marginTop: theme.spacing(1),
              })}
            >
              <StyledTypography
                sx={(theme) => ({
                  background: theme.palette.primary.main,
                })}
              >
                {msg.message}
              </StyledTypography>
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
              <StyledTypography
                sx={(theme) => ({
                  background: theme.palette.secondary.main,
                })}
              >
                {msg.message}
              </StyledTypography>
            </Box>
          )
        )}
      </Box>
      <TextField
        placeholder="Type message..."
        margin="none"
        multiline
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          const trimmedValue = inputValue.trim();
          if (e.key === "Enter" && !e.shiftKey && trimmedValue !== "") {
            e.preventDefault();
            communicationSocket?.emit(CommunicationEvents.SEND_TEXT_MESSAGE, {
              roomId: roomId,
              message: trimmedValue,
              username: collabUser?.username,
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
