import { Socket } from "socket.io";
import { io } from "../server";
import redisClient from "../config/redis";
import { ChangeSet, Text } from "@codemirror/state";
import { rebaseUpdates, Update } from "@codemirror/collab";

enum CollabEvents {
  // Receive
  JOIN = "join",
  CHANGE = "change",
  LEAVE = "leave",
  DISCONNECT = "disconnect",

  PUSH_UPDATES = "push_updates",
  PULL_UPDATES = "pull_updates",
  GET_DOCUMENT = "get_document",

  // Send
  ROOM_FULL = "room_full",
  CONNECTED = "connected",
  NEW_USER_CONNECTED = "new_user_connected",
  CODE_CHANGE = "code_change",
  PARTNER_LEFT = "partner_left",
  PARTNER_DISCONNECTED = "partner_disconnected",

  PULL_UPDATES_RESPONSE = "pull_updates_response",
  GET_DOCUMENT_RESPONSE = "get_document_response",
}

const EXPIRY_TIME = 3600;

export const handleWebsocketCollabEvents = (socket: Socket) => {
  socket.on(CollabEvents.JOIN, async ({ roomId }) => {
    if (!roomId) {
      return;
    }

    const room = io.sockets.adapter.rooms.get(roomId);
    if (room && room.size >= 2) {
      socket.emit(CollabEvents.ROOM_FULL);
      return;
    }

    socket.join(roomId);
    socket.data.roomId = roomId;

    // in case of disconnect, send the code to the user when he rejoins
    const code = await redisClient.get(`collaboration:${roomId}`);
    socket.emit(CollabEvents.CONNECTED, { code: code ? code : "" });

    // inform the other user that a new user has joined
    socket.to(roomId).emit(CollabEvents.NEW_USER_CONNECTED);
  });

  socket.on(CollabEvents.CHANGE, async ({ roomId, code }) => {
    if (!roomId || !code) {
      return;
    }

    await redisClient.set(`collaboration:${roomId}`, code, {
      EX: EXPIRY_TIME,
    });
    socket.to(roomId).emit(CollabEvents.CODE_CHANGE, { code });
  });

  socket.on(CollabEvents.LEAVE, ({ roomId }) => {
    if (!roomId) {
      return;
    }

    socket.leave(roomId);
    socket.to(roomId).emit(CollabEvents.PARTNER_LEFT);
  });

  socket.on(CollabEvents.DISCONNECT, () => {
    const { roomId } = socket.data;
    if (roomId) {
      socket.to(roomId).emit(CollabEvents.PARTNER_DISCONNECTED);
    }
  });

  handleCodeEditorEvents(socket);
};

/* Code Editor Events */
// Adapted from https://codemirror.net/examples/collab/ and https://github.com/BjornTheProgrammer/react-codemirror-collab-sockets

let updates: Update[] = []; // updates.length = current version
let doc = Text.of(["Start document"]);
let pendingPullUpdatesRequests: ((updates: Update[]) => void)[] = [];

const handleCodeEditorEvents = (socket: Socket) => {
  socket.on(CollabEvents.PULL_UPDATES, (version: number) => {
    if (version < updates.length) {
      // send the new updates
      socket.emit(
        CollabEvents.PULL_UPDATES_RESPONSE,
        JSON.stringify(updates.slice(version))
      );
    } else {
      // wait until there are new updates to send
      pendingPullUpdatesRequests.push((updates) => {
        socket.emit(
          CollabEvents.PULL_UPDATES_RESPONSE,
          JSON.stringify(updates.slice(version))
        );
      });
    }
  });

  // received new updates, notify any pending pullUpdates requests
  socket.on(
    CollabEvents.PUSH_UPDATES,
    (version: number, newUpdates: string, callback: () => void) => {
      let docUpdates = JSON.parse(newUpdates) as readonly Update[];

      try {
        // If the given version is the latest version, apply the new updates.
        // Else, rebase updates first.
        if (version != updates.length) {
          docUpdates = rebaseUpdates(docUpdates, updates.slice(version));
        }

        for (const update of docUpdates) {
          const changes = ChangeSet.fromJSON(update.changes);
          updates.push({
            clientID: update.clientID,
            changes: changes,
            effects: update.effects,
          });
          doc = changes.apply(doc);
        }
        callback();

        while (pendingPullUpdatesRequests.length) {
          pendingPullUpdatesRequests.pop()!(updates);
        }
      } catch (error) {
        console.error(error);
        callback();
      }
    }
  );

  socket.on(CollabEvents.GET_DOCUMENT, () => {
    socket.emit(
      CollabEvents.GET_DOCUMENT_RESPONSE,
      updates.length,
      doc.toString()
    );
  });
};
