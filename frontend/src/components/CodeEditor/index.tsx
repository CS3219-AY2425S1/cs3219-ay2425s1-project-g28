import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { useEffect, useState } from "react";
import {
  getDocument,
  initDocument,
  peerExtension,
  removeListeners,
} from "../../utils/collabSocket";
import Loader from "../Loader";
import { cursorExtension } from "../../utils/collabCursor";

interface CodeEditorProps {
  uid: string;
  username: string;
  language: string;
  template?: string;
  roomId?: string;
  isReadOnly?: boolean;
}

type CodeEditorState = {
  version: number | null;
  doc: string | null;
};

const languageSupport = {
  Python: langs.python(),
  Java: langs.java(),
  C: langs.c(),
};

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const {
    uid,
    username,
    language,
    template = "",
    roomId = "",
    isReadOnly = false,
  } = props;

  const [codeEditorState, setCodeEditorState] = useState<CodeEditorState>({
    version: null,
    doc: null,
  });

  useEffect(() => {
    if (isReadOnly) {
      setCodeEditorState({
        version: 0,
        doc: template,
      });
      return;
    }

    const fetchDocument = async () => {
      try {
        if (template) {
          await initDocument(template);
        }
        const { version, doc } = await getDocument();
        setCodeEditorState({
          version: version,
          doc: doc.toString(),
        });
      } catch (error) {
        console.error("Error fetching document: ", error);
      }
    };

    fetchDocument();

    return () => removeListeners();
  }, []);

  if (codeEditorState.version === null || codeEditorState.doc === null) {
    return <Loader />;
  }

  return (
    <CodeMirror
      height="300px"
      width="300px"
      basicSetup={false}
      id="codeEditor"
      extensions={[
        basicSetup(),
        languageSupport[language as keyof typeof languageSupport],
        peerExtension(codeEditorState.version, uid, roomId),
        cursorExtension(uid, username),
        EditorView.editable.of(!isReadOnly),
        EditorState.readOnly.of(isReadOnly),
      ]}
      value={codeEditorState.doc}
    />
  );
};

export default CodeEditor;
