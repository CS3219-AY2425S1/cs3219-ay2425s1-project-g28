import http from "http";
import app, { allowedOrigins } from "./app.ts";
import { handleWebsocketCollabEvents } from "./handlers/websocketHandler.ts";
import { Server, Socket } from "socket.io";
import { connectRedis } from "./config/redis.ts";
import { ChangeSet, Text } from "@codemirror/state";
import { Update } from "@codemirror/collab";

let updates: Update[] = [];
let doc = Text.of(["Start document"]);
let pending: ((value: any) => void)[] = [];

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {},
});

io.on("connection", (socket: Socket) => {
  handleWebsocketCollabEvents(socket);

  socket.on("pullUpdates", (version: number) => {
    if (version < updates.length) {
      socket.emit("pullUpdateResponse", JSON.stringify(updates.slice(version)));
    } else {
      pending.push((updates) => {
        socket.emit(
          "pullUpdateResponse",
          JSON.stringify(updates.slice(version))
        );
      });
    }
  });

  socket.on("pushUpdates", (version, docUpdates) => {
    docUpdates = JSON.parse(docUpdates);

    try {
      if (version != updates.length) {
        socket.emit("pushUpdateResponse", false);
      } else {
        for (let update of docUpdates) {
          let changes = ChangeSet.fromJSON(update.changes);
          updates.push({
            changes,
            clientID: update.clientID,
            effects: update.effects, // cursor
          });
          doc = changes.apply(doc);
        }
        socket.emit("pushUpdateResponse", true);

        while (pending.length) {
          pending.pop()!(updates);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("getDocument", () => {
    socket.emit("getDocumentResponse", updates.length, doc.toString());
  });
});

const PORT = process.env.SERVICE_PORT || 3003;

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`Collab service server listening on http://localhost:${PORT}`);
  });

  connectRedis();
}
