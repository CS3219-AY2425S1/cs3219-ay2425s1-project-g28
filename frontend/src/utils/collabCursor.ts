import {
  EditorView,
  Decoration,
  DecorationSet,
  WidgetType,
} from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";

// Adapted from https://github.com/BjornTheProgrammer/react-codemirror-collab-sockets

export interface Cursor {
  uid: string;
  username: string;
  from: number;
  to: number;
}

class CursorWidget extends WidgetType {
  private username: string;
  private colorClass: string;

  constructor(username: string, color: number) {
    super();
    this.colorClass = `cm-cursor-color-${color}`;
    this.username = username;
  }

  toDOM() {
    const cursorRoot = document.createElement("div");
    cursorRoot.className = "cm-cursor-root";

    const cursor = document.createElement("div");
    cursor.className = `cm-cursor-display ${this.colorClass}`;
    cursorRoot.appendChild(cursor);

    const cursorLabel = document.createElement("div");
    cursorLabel.className = `cm-cursor-label ${this.colorClass}`;
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

const cursors = new Map<string, number>();

const cursorStateField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update: (prevCursorState, transaction) => {
    let cursorTransactions = prevCursorState.map(transaction.changes);
    for (const effect of transaction.effects) {
      if (effect.is(updateCursor)) {
        const cursorUpdates = [];

        if (!cursors.has(effect.value.uid)) {
          cursors.set(effect.value.uid, cursors.size + 1);
        }

        if (effect.value.from !== effect.value.to) {
          // highlight selected text
          cursorUpdates.push(
            Decoration.mark({
              class: `cm-highlight-color-${cursors.get(effect.value.uid)!}`,
              uid: effect.value.uid,
            }).range(effect.value.from, effect.value.to)
          );
        }

        cursorUpdates.push(
          Decoration.widget({
            widget: new CursorWidget(
              effect.value.username,
              cursors.get(effect.value.uid)!
            ),
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
  ".cm-cursor-color-1": {
    backgroundColor: "#f6a1a1",
  },
  ".cm-cursor-color-2": {
    backgroundColor: "#d6a3e8",
  },
  ".cm-highlight-color-1": {
    backgroundColor: "rgba(246, 161, 161, 0.3)",
  },
  ".cm-highlight-color-2": {
    backgroundColor: "rgba(214, 163, 232, 0.3)",
  },
});

export const cursorExtension = (uid: string, username: string) => {
  return [
    cursorStateField, // handles cursor positions and highlights
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

          update.view.dispatch({
            effects: updateCursor.of(cursor),
          });
        }
      });
    }),
  ];
};
