import http from "http";
import app, { allowedOrigins } from "./app.ts";
import { handleWebsocketMatchEvents } from "./handlers/websocketHandler.ts";
import { Server } from "socket.io";
import { connectToRabbitMq } from "./config/rabbitmq.ts";
import { verifyUserToken } from "./middlewares/basicAccessControl.ts";

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {},
});

io.use(verifyUserToken);

io.on("connection", (socket) => {
  handleWebsocketMatchEvents(socket);
});

const PORT = process.env.SERVICE_PORT || 3002;

if (process.env.NODE_ENV !== "test") {
  connectToRabbitMq()
    .then(() => {
      console.log("RabbitMq connected!");

      server.listen(PORT, () => {
        console.log(
          `Matching service server listening on http://localhost:${PORT}`
        );
      });
    })
    .catch((err) => {
      console.error("Failed to connect to RabbitMq");
      console.error(err);
    });
}
