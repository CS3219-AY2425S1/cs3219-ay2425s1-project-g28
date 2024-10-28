import { Box, TextField } from "@mui/material";

const Chat: React.FC = () => {
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
      <Box sx={{ overflow: "auto", flex: 3 }}>{/* Chat messages */}</Box>
      <Box
        sx={{ flex: 1, display: "flex", alignItems: "flex-end", zIndex: 10 }}
      >
        <TextField placeholder="Type message..." margin="normal" fullWidth />
      </Box>
    </Box>
  );
};

export default Chat;
