import http from "http";
import app, { allowedOrigins } from "./app.ts";
import { handleWebsocketCollabEvents } from "./handlers/websocketHandler.ts";
import { Server } from "socket.io";
import { connectRedis } from "./config/redis.ts";

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {},
});

io.on("connection", (socket) => {
  handleWebsocketCollabEvents(socket);
});

const PORT = process.env.SERVICE_PORT || 3003;

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`Collab service server listening on http://localhost:${PORT}`);
  });

  connectRedis();
}
