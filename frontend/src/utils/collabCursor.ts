import {
  EditorView,
  Decoration,
  DecorationSet,
  WidgetType,
} from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";
import { receiveCursorUpdate, sendCursorUpdate } from "./collabSocket";

// Adapted from https://github.com/BjornTheProgrammer/react-codemirror-collab-sockets

export interface Cursor {
  uid: string;
  username: string;
  from: number;
  to: number;
}

class CursorWidget extends WidgetType {
  private username: string;

  constructor(username: string) {
    super();
    this.username = username;
  }

  toDOM() {
    const cursorRoot = document.createElement("div");
    cursorRoot.className = "cm-cursor-root";

    const cursor = document.createElement("div");
    cursor.className = `cm-cursor-display cm-cursor-color`;
    cursorRoot.appendChild(cursor);

    const cursorLabel = document.createElement("div");
    cursorLabel.className = `cm-cursor-label cm-cursor-color`;
    cursorLabel.textContent = this.username;
    cursorRoot.appendChild(cursorLabel);

    let labelTimeout = setTimeout(() => {
      cursorLabel.style.display = "none";
    }, 2000);

    cursor.addEventListener("mouseenter", () => {
      clearTimeout(labelTimeout);
      cursorLabel.style.display = "block";
    });

    cursor.addEventListener("mouseleave", () => {
      labelTimeout = setTimeout(() => {
        cursorLabel.style.display = "none";
      }, 2000);
    });

    return cursorRoot;
  }
}

export const updateCursor = StateEffect.define<Cursor>();

const cursorStateField = (uid: string): StateField<DecorationSet> => {
  return StateField.define<DecorationSet>({
    create: () => Decoration.none,
    update: (prevCursorState, transaction) => {
      let cursorTransactions = prevCursorState.map(transaction.changes);
      for (const effect of transaction.effects) {
        // check for partner's cursor updates
        if (effect.is(updateCursor) && effect.value.uid !== uid) {
          // if (effect.is(updateCursor)) {
          const cursorUpdates = [];

          if (effect.value.from !== effect.value.to) {
            // highlight selected text
            cursorUpdates.push(
              Decoration.mark({
                class: "cm-highlight-color",
                uid: effect.value.uid,
              }).range(effect.value.from, effect.value.to)
            );
          }

          cursorUpdates.push(
            Decoration.widget({
              widget: new CursorWidget(effect.value.username),
              uid: effect.value.uid,
            }).range(effect.value.to)
          );

          // ensure only the latest cursor position and/or selection is displayed
          cursorTransactions = cursorTransactions.update({
            add: cursorUpdates,
            filter: (_from, _to, value) => value.spec.uid !== effect.value.uid,
          });
        }
      }
      return cursorTransactions;
    },
    provide: (field) => EditorView.decorations.from(field),
  });
};

const cursorBaseTheme = EditorView.baseTheme({
  ".cm-cursor-root": {
    display: "inline-block",
    width: "0px",
    height: "0px",
  },
  ".cm-cursor-display": {
    border: "none",
    width: "0.5px",
    height: "18.5px",
    position: "absolute",
    marginTop: "-14.5px",
    marginLeft: "0px",
  },
  ".cm-cursor-label": {
    color: "white",
    borderRadius: "4px 4px 4px 0px",
    padding: "2px 4px",
    fontSize: "12px",
    position: "absolute",
    marginTop: "-35px",
    marginLeft: "0px",
  },
  ".cm-cursor-color": {
    backgroundColor: "#f6a1a1",
  },
  ".cm-highlight-color": {
    backgroundColor: "rgba(246, 161, 161, 0.3)",
  },
});

export const cursorExtension = (
  roomId: string,
  uid: string,
  username: string
) => {
  return [
    cursorStateField(uid), // handles cursor positions and highlights
    cursorBaseTheme, // provides cursor styling
    // detects cursor updates
    EditorView.updateListener.of((update) => {
      update.transactions.forEach((transaction) => {
        if (transaction.selection) {
          const cursor: Cursor = {
            uid: uid,
            username: username,
            from: transaction.selection.ranges[0].from,
            to: transaction.selection.ranges[0].to,
          };

          sendCursorUpdate(roomId, cursor);
        }
      });

      receiveCursorUpdate(update.view);
    }),
  ];
};
