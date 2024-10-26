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
import { addCursor, Cursor, removeCursor } from "./collabCursor";

export const collabSocket = io("http://localhost:3003");

const pushUpdates = (
  version: number,
  fullUpdates: readonly Update[]
): Promise<boolean> => {
  const updates = fullUpdates.map((u) => ({
    clientID: u.clientID,
    changes: u.changes.toJSON(),
    effects: u.effects, // cursor
  }));

  return new Promise(function (resolve) {
    collabSocket.emit("pushUpdates", version, JSON.stringify(updates));

    collabSocket.once("pushUpdateResponse", (status: boolean) => {
      resolve(status);
    });
  });
};

const pullUpdates = (version: number): Promise<readonly Update[]> => {
  return new Promise(function (resolve) {
    collabSocket.emit("pullUpdates", version);

    collabSocket.once("pullUpdateResponse", (updates: any) => {
      resolve(JSON.parse(updates));
    });
  }).then((updates: any) =>
    //   updates.map((u: any) => ({
    //     changes: ChangeSet.fromJSON(u.changes),
    //     clientID: u.clientID,
    //   }))

    updates.map((u: any) => {
      const effects: StateEffect<any>[] = [];
      if (u.effects?.length) {
        u.effects.forEach((effect: StateEffect<any>) => {
          if (effect.value?.id && effect.value?.from) {
            const cursor: Cursor = {
              id: effect.value.id,
              from: effect.value.from,
              to: effect.value.to,
            };
            effects.push(addCursor.of(cursor));
          } else if (effect.value?.id) {
            const cursorId = effect.value.id;
            effects.push(removeCursor.of(cursorId));
          }
        });
      }

      return {
        changes: ChangeSet.fromJSON(u.changes),
        clientID: u.clientID,
        effects: effects,
      };
    })
  );
};

export const getDocument = (): Promise<{ version: number; doc: Text }> => {
  return new Promise(function (resolve) {
    collabSocket.emit("getDocument");

    collabSocket.once("getDocumentResponse", (version: number, doc: string) => {
      resolve({
        version: version,
        doc: Text.of(doc.split("\n")),
      });
    });
  });
};

export const peerExtension = (startVersion: number, id?: string) => {
  const plugin = ViewPlugin.fromClass(
    class {
      private pushing = false;
      private done = false;

      constructor(private view: EditorView) {
        this.pull();
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.transactions.length) {
          // cursor
          // if (update.docChanged) {
          this.push();
        }
      }

      async push() {
        const updates = sendableUpdates(this.view.state);
        if (this.pushing || !updates.length) {
          return;
        }
        this.pushing = true;
        const version = getSyncedVersion(this.view.state);
        await pushUpdates(version, updates);
        this.pushing = false;
        if (sendableUpdates(this.view.state).length) {
          setTimeout(() => this.push(), 100);
        }
      }

      async pull() {
        while (!this.done) {
          const version = getSyncedVersion(this.view.state);
          const updates = await pullUpdates(version);
          this.view.dispatch(receiveUpdates(this.view.state, updates));
        }
      }

      destroy() {
        this.done = true;
      }
    }
  );

  // return [collab({ startVersion }), plugin];
  return [
    collab({
      startVersion,
      clientID: id,
      sharedEffects: (tr) =>
        tr.effects.filter((e) => e.is(addCursor) || e.is(removeCursor)),
    }),
    plugin,
  ];
};
