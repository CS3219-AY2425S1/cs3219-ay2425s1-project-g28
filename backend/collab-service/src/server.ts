import http from "http";
import app, { allowedOrigins } from "./app";
import { handleWebsocketCollabEvents } from "./handlers/websocketHandler";
import { Server, Socket } from "socket.io";
import { connectRedis } from "./config/redis";
import { verifyUserToken } from "./middlewares/basicAccessControl";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {},
});

io.use(verifyUserToken);

io.on("connection", (socket: Socket) => {
  handleWebsocketCollabEvents(socket);
});

const PORT = process.env.SERVICE_PORT || 3003;

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`Collab service server listening on http://localhost:${PORT}`);
  });

  connectRedis();
}
