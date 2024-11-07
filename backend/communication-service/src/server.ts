import app, { allowedOrigins } from "./app";
import { createServer } from "http";
import { Server } from "socket.io";
import { handleWebsocketCommunicationEvents } from "./handlers/websocketHandler";
import { verifyUserToken } from "./middlewares/basicAccessControl";

const PORT = process.env.SERVICE_PORT || 3005;

const server = createServer(app);

export const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
  connectionStateRecovery: {},
});

io.use(verifyUserToken);

io.on("connection", handleWebsocketCommunicationEvents);

server.listen(PORT, () => {
  console.log(
    `Communication service server listening on port http://localhost:${PORT}`
  );
});
