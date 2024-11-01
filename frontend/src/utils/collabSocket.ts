import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { Text, ChangeSet, StateEffect } from "@codemirror/state";
import {
  Update,
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
} from "@codemirror/collab";
import { io } from "socket.io-client";
import { updateCursor, Cursor } from "./collabCursor";

// Adapted from https://codemirror.net/examples/collab/ and https://github.com/BjornTheProgrammer/react-codemirror-collab-sockets

enum CollabEvents {
  // Send
  JOIN = "join",
  LEAVE = "leave",

  PUSH_UPDATES = "push_updates",
  PULL_UPDATES = "pull_updates",
  INIT_DOCUMENT = "init_document",
  GET_DOCUMENT = "get_document",

  // Receive
  USER_CONNECTED = "user_connected",

  PULL_UPDATES_RESPONSE = "pull_updates_response",
  GET_DOCUMENT_RESPONSE = "get_document_response",
}

const COLLAB_SOCKET_URL = "http://localhost:3003";
const collabSocket = io(COLLAB_SOCKET_URL, {
  reconnectionAttempts: 3,
  autoConnect: false,
});

const pushUpdates = (
  roomId: string,
  version: number,
  fullUpdates: readonly Update[]
): Promise<void> => {
  const updates = fullUpdates.map((update) => ({
    clientID: update.clientID, // client who made the update
    changes: update.changes.toJSON(), // document updates
    effects: update.effects, // cursor updates
  }));

  return new Promise((resolve) => {
    collabSocket.emit(
      CollabEvents.PUSH_UPDATES,
      roomId,
      version,
      JSON.stringify(updates),
      () => resolve()
    );
  });
};

const pullUpdates = (
  roomId: string,
  version: number
): Promise<readonly Update[]> => {
  return new Promise<readonly Update[]>((resolve) => {
    collabSocket.emit(CollabEvents.PULL_UPDATES, roomId, version);

    collabSocket.once(CollabEvents.PULL_UPDATES_RESPONSE, (updates: string) => {
      resolve(JSON.parse(updates));
    });
  }).then((updates) =>
    updates.map((update) => {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      const effects: StateEffect<any>[] = [];

      update.effects?.forEach((effect) => {
        if (
          effect.value.uid &&
          effect.value.username &&
          effect.value.from &&
          effect.value.to
        ) {
          const cursor: Cursor = {
            uid: effect.value.uid,
            username: effect.value.username,
            from: effect.value.from,
            to: effect.value.to,
          };
          effects.push(updateCursor.of(cursor));
        }
      });

      return {
        clientID: update.clientID,
        changes: ChangeSet.fromJSON(update.changes),
        effects: effects,
      };
    })
  );
};

export const join = (roomId: string): Promise<void> => {
  collabSocket.connect();
  collabSocket.emit(CollabEvents.JOIN, roomId);

  return new Promise((resolve) => {
    collabSocket.once(CollabEvents.USER_CONNECTED, () => resolve());
  });
};

export const leave = (roomId: string) => {
  collabSocket.emit(CollabEvents.LEAVE, roomId);
  collabSocket.disconnect();
};

export const initDocument = (
  roomId: string,
  template: string
): Promise<void> => {
  return new Promise((resolve) => {
    collabSocket.emit(CollabEvents.INIT_DOCUMENT, roomId, template, () =>
      resolve()
    );
  });
};

export const getDocument = (
  roomId: string
): Promise<{ version: number; doc: Text }> => {
  return new Promise((resolve) => {
    collabSocket.emit(CollabEvents.GET_DOCUMENT, roomId);

    collabSocket.once(
      CollabEvents.GET_DOCUMENT_RESPONSE,
      (version: number, doc: string) => {
        resolve({
          version: version,
          doc: Text.of(doc.split("\n")),
        });
      }
    );
  });
};

// handles push and pull updates
export const peerExtension = (
  roomId: string,
  startVersion: number,
  uid: string
) => {
  const plugin = ViewPlugin.fromClass(
    class {
      private pushingUpdates = false; // to ensure only one running push request
      private pullUpdates = true;

      constructor(private view: EditorView) {
        this.pull();
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.transactions.length) {
          this.push();
        }
      }

      async push() {
        const updates = sendableUpdates(this.view.state);
        if (this.pushingUpdates || !updates.length) {
          return;
        }
        this.pushingUpdates = true;
        const version = getSyncedVersion(this.view.state);
        await pushUpdates(roomId, version, updates);
        this.pushingUpdates = false;

        // check if there are still updates to push (failed / new updates)
        if (sendableUpdates(this.view.state).length) {
          setTimeout(() => this.push(), 100);
        }
      }

      async pull() {
        while (this.pullUpdates) {
          const version = getSyncedVersion(this.view.state);
          const updates = await pullUpdates(roomId, version); // returns only if there are updates
          this.view.dispatch(receiveUpdates(this.view.state, updates));
        }
      }

      destroy() {
        this.pullUpdates = false;
      }
    }
  );

  return [
    collab({
      startVersion: startVersion,
      clientID: uid,
      sharedEffects: (transaction) =>
        transaction.effects.filter((effect) => effect.is(updateCursor)),
    }),
    plugin,
  ];
};
