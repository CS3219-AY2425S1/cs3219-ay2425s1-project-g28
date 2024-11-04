import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { useEffect, useRef } from "react";
import { initDocument } from "../../utils/collabSocket";
import { cursorExtension } from "../../utils/collabCursor";
import { yCollab } from "y-codemirror.next";
import { Text } from "yjs";
import { Awareness } from "y-protocols/awareness";

interface CodeEditorProps {
  editorState?: { text: Text; awareness: Awareness };
  uid?: string;
  username?: string;
  language: string;
  template?: string;
  roomId?: string;
  isReadOnly?: boolean;
}

const languageSupport = {
  Python: langs.python(),
  Java: langs.java(),
  C: langs.c(),
};

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const {
    editorState,
    uid = "",
    username = "",
    language,
    template = "",
    roomId = "",
    isReadOnly = false,
  } = props;

  const effectRan = useRef<boolean>(false);

  useEffect(() => {
    if (isReadOnly) {
      return;
    }

    if (!effectRan.current) {
      initDocument(roomId, template);
    }

    return () => {
      effectRan.current = true;
    };
  }, []);

  return (
    <CodeMirror
      style={{ height: "100%", width: "100%" }}
      height="100%"
      width="100%"
      basicSetup={false}
      id="codeEditor"
      extensions={[
        basicSetup(),
        languageSupport[language as keyof typeof languageSupport],
        ...(!isReadOnly && editorState
          ? [
              yCollab(editorState.text, editorState.awareness),
              cursorExtension(roomId, uid, username),
            ]
          : []),
        EditorView.editable.of(!isReadOnly),
        EditorState.readOnly.of(isReadOnly),
      ]}
      value={isReadOnly ? template : undefined}
    />
  );
};

export default CodeEditor;
