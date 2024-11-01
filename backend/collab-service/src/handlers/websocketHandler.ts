import { Socket } from "socket.io";
import { io } from "../server";
import redisClient from "../config/redis";
import { ChangeSet, Text } from "@codemirror/state";
import { rebaseUpdates, Update } from "@codemirror/collab";

enum CollabEvents {
  // Receive
  JOIN = "join",
  // CHANGE = "change",
  LEAVE = "leave",
  DISCONNECT = "disconnect",

  PUSH_UPDATES = "push_updates",
  PULL_UPDATES = "pull_updates",
  INIT_DOCUMENT = "init_document",
  GET_DOCUMENT = "get_document",

  // Send
  ROOM_FULL = "room_full",
  USER_CONNECTED = "user_connected",
  NEW_USER_CONNECTED = "new_user_connected",
  // CODE_CHANGE = "code_change",
  PARTNER_LEFT = "partner_left",
  PARTNER_DISCONNECTED = "partner_disconnected",

  PULL_UPDATES_RESPONSE = "pull_updates_response",
  GET_DOCUMENT_RESPONSE = "get_document_response",
}

const EXPIRY_TIME = 3600;

interface CollabSession {
  updates: Update[]; // updates.length = current version
  doc: Text;
  pendingPullUpdatesRequests: ((updates: Update[]) => void)[];
}

const collabSessions = new Map<string, CollabSession>();

export const handleWebsocketCollabEvents = (socket: Socket) => {
  socket.on(CollabEvents.JOIN, async (roomId: string) => {
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
    const collabSession = await redisClient.get(`collaboration:${roomId}`);
    if (collabSession) {
      if (!collabSessions.has(roomId)) {
        collabSessions.set(roomId, JSON.parse(collabSession) as CollabSession);
      }
    } else {
      initCollabSession(roomId);
    }
    socket.emit(CollabEvents.USER_CONNECTED);

    // inform the other user that a new user has joined
    socket.to(roomId).emit(CollabEvents.NEW_USER_CONNECTED);
  });

  // socket.on(CollabEvents.CHANGE, async (roomId: string, code: string) => {
  //   if (!roomId || !code) {
  //     return;
  //   }

  //   await redisClient.set(`collaboration:${roomId}`, code, {
  //     EX: EXPIRY_TIME,
  //   });
  //   socket.to(roomId).emit(CollabEvents.CODE_CHANGE, code);
  // });

  socket.on(CollabEvents.LEAVE, (roomId: string) => {
    if (!roomId) {
      return;
    }

    socket.leave(roomId);
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room?.size === 0) {
      collabSessions.delete(roomId);
    } else {
      socket.to(roomId).emit(CollabEvents.PARTNER_LEFT);
    }
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

const handleCodeEditorEvents = (socket: Socket) => {
  socket.on(
    CollabEvents.INIT_DOCUMENT,
    (roomId: string, template: string, callback: () => void) => {
      initCollabSession(roomId, template);
      callback();
    }
  );

  socket.on(CollabEvents.GET_DOCUMENT, (roomId: string) => {
    const { updates, doc } = initCollabSession(roomId);
    socket.emit(
      CollabEvents.GET_DOCUMENT_RESPONSE,
      updates.length,
      doc.toString()
    );
  });

  socket.on(CollabEvents.PULL_UPDATES, (roomId: string, version: number) => {
    const { updates, pendingPullUpdatesRequests } = initCollabSession(roomId);
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
    async (
      roomId: string,
      version: number,
      newUpdates: string,
      callback: () => void
    ) => {
      const { updates, doc, pendingPullUpdatesRequests } =
        initCollabSession(roomId);
      let docUpdates = JSON.parse(newUpdates) as readonly Update[];

      try {
        // If the given version is the latest version, apply the new updates.
        // Else, rebase updates first.
        if (version < updates.length) {
          docUpdates = rebaseUpdates(docUpdates, updates.slice(version));
        }

        for (const update of docUpdates) {
          const changes = ChangeSet.fromJSON(update.changes);
          updates.push({
            clientID: update.clientID,
            changes: changes,
            effects: update.effects,
          });

          const updatedCollabSession = {
            updates: updates,
            doc: changes.apply(doc),
            pendingPullUpdatesRequests: pendingPullUpdatesRequests,
          };
          collabSessions.set(roomId, updatedCollabSession);

          await redisClient.set(
            `collaboration:${roomId}`,
            JSON.stringify(updatedCollabSession),
            {
              EX: EXPIRY_TIME,
            }
          );
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
};

const initCollabSession = (
  roomId: string,
  template?: string
): CollabSession => {
  const collabSession = collabSessions.get(roomId);
  if (!collabSession) {
    collabSessions.set(roomId, {
      updates: [],
      doc: Text.of([template ? template : ""]),
      pendingPullUpdatesRequests: [],
    });
  } else if (template) {
    collabSessions.set(roomId, {
      ...collabSession,
      doc: Text.of([template]),
    });
  }
  return collabSessions.get(roomId)!;
};
