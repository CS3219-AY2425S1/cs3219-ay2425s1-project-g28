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

class TooltipWidget extends WidgetType {
  private name = "John";
  private suffix = "";

  constructor(name: string, color: number) {
    super();
    this.suffix = `${(color % 8) + 1}`;
    this.name = name;
  }

  toDOM() {
    const dom = document.createElement("div");
    dom.className = "cm-tooltip-none";

    const cursor_tooltip = document.createElement("div");
    cursor_tooltip.className = `cm-tooltip-cursor cm-tooltip cm-tooltip-above cm-tooltip-${this.suffix}`;
    cursor_tooltip.textContent = this.name;

    const cursor_tooltip_arrow = document.createElement("div");
    cursor_tooltip_arrow.className = "cm-tooltip-arrow";

    cursor_tooltip.appendChild(cursor_tooltip_arrow);
    dom.appendChild(cursor_tooltip);
    return dom;
  }

  ignoreEvent() {
    return false;
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
        const addUpdates = [];
        if (!cursors.has(effect.value.uid)) {
          cursors.set(effect.value.uid, cursors.size);
        }
        if (effect.value.from !== effect.value.to) {
          // highlight selected text
          addUpdates.push(
            Decoration.mark({
              class: `cm-highlight-${(cursors.get(effect.value.uid)! % 8) + 1}`,
              uid: effect.value.uid,
            }).range(effect.value.from, effect.value.to)
          );
        }

        addUpdates.push(
          Decoration.widget({
            widget: new TooltipWidget(
              effect.value.username,
              cursors.get(effect.value.uid)!
            ),
            block: false,
            uid: effect.value.uid,
          }).range(effect.value.to, effect.value.to)
        );

        // ensure only the latest cursor position and/or selection is displayed
        cursorTransactions = cursorTransactions.update({
          add: addUpdates,
          filter: (_from, _to, value) => value?.spec?.uid !== effect.value.uid,
        });
      }
    }
    return cursorTransactions;
  },
  provide: (field) => EditorView.decorations.from(field),
});

const cursorBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-cursor": {
    color: "white",
    border: "none",
    padding: "2px 7px",
    borderRadius: "4px",
    position: "absolute",
    marginTop: "-40px",
    marginLeft: "-14px",
    "& .cm-tooltip-arrow:after": {
      borderTopColor: "transparent",
    },
    zIndex: "1000000",
  },
  ".cm-tooltip-none": {
    width: "0px",
    height: "0px",
    display: "inline-block",
  },
  ".cm-highlight-1": {
    backgroundColor: "#6666BB55",
  },
  ".cm-highlight-2": {
    backgroundColor: "#F76E6E55",
  },
  ".cm-highlight-3": {
    backgroundColor: "#0CDA6255",
  },
  ".cm-highlight-4": {
    backgroundColor: "#0CC5DA55",
  },
  ".cm-highlight-5": {
    backgroundColor: "#0C51DA55",
  },
  ".cm-highlight-6": {
    backgroundColor: "#980CDA55",
  },
  ".cm-highlight-7": {
    backgroundColor: "#DA0CBB55",
  },
  ".cm-highlight-8": {
    backgroundColor: "#DA800C55",
  },
  ".cm-tooltip-1": {
    backgroundColor: "#66b !important",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#66b !important",
    },
  },
  ".cm-tooltip-2": {
    backgroundColor: "#F76E6E !important",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#F76E6E !important",
    },
  },
  ".cm-tooltip-3": {
    backgroundColor: "#0CDA62 !important",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#0CDA62 !important",
    },
  },
  ".cm-tooltip-4": {
    backgroundColor: "#0CC5DA !important",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#0CC5DA !important",
    },
  },
  ".cm-tooltip-5": {
    backgroundColor: "#0C51DA !important",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#0C51DA !important",
    },
  },
  ".cm-tooltip-6": {
    backgroundColor: "#980CDA !important",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#980CDA !important",
    },
  },
  ".cm-tooltip-7": {
    backgroundColor: "#DA0CBB !important",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#DA0CBB !important",
    },
  },
  ".cm-tooltip-8": {
    backgroundColor: "#DA800C !important",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#DA800C !important",
    },
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
