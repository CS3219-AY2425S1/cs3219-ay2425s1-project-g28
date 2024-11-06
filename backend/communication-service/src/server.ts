import app, { allowedOrigins } from "./app";
import { createServer } from "http";
import { Server } from "socket.io";
import { handleWebsocketCommunicationEvents } from "./handlers/websocketHandler";
import { verifyToken } from "./utils/userServiceApi";

const PORT = process.env.SERVICE_PORT || 3005;

const server = createServer(app);

export const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
  connectionStateRecovery: {},
});

io.use((socket, next) => {
  const token =
    socket.handshake.headers.authorization || socket.handshake.auth.token;
  verifyToken(token)
    .then(() => {
      console.log("Valid credentials");
      next();
    })
    .catch((err) => {
      console.error(err);
      next(new Error("Unauthorized"));
    });
});

io.on("connection", handleWebsocketCommunicationEvents);

server.listen(PORT, () => {
  console.log(
    `Communication service server listening on port http://localhost:${PORT}`
  );
});
