import app, { allowedOrigins } from "./app";
import { createServer } from "http";
import { Server } from "socket.io";
import { handleWebsocketCommunicationEvents } from "./handlers/websocketHandler";

const PORT = process.env.SERVICE_PORT || 3005;

const server = createServer(app);

export const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
  connectionStateRecovery: {},
});

io.on("connection", handleWebsocketCommunicationEvents);

server.listen(PORT, () => {
  console.log(
    `Communication service server listening on port http://localhost:${PORT}`
  );
});
