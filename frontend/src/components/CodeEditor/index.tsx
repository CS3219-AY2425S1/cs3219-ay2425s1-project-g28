import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { useEffect, useState } from "react";
import {
  collabSocket,
  getDocument,
  peerExtension,
} from "../../utils/collabSocket";
import Loader from "../Loader";
import { cursorExtension } from "../../utils/collabCursor";

interface CodeEditorProps {
  username: string;
}

type EditorState = {
  connected: boolean;
  version: number | null;
  doc: string | null;
};

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { username } = props;

  const [editorState, setEditorState] = useState<EditorState>({
    connected: false,
    version: null,
    doc: null,
  });

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const { version, doc } = await getDocument();
        setEditorState((prevState) => ({
          ...prevState,
          version: version,
          doc: doc.toString(),
        }));

        collabSocket.on("connect", () => {
          setEditorState((prevState) => ({
            ...prevState,
            connected: true,
          }));
        });

        collabSocket.on("disconnect", () => {
          setEditorState((prevState) => ({
            ...prevState,
            connected: false,
          }));
        });
      } catch (error) {
        console.error("Error fetching document: ", error);
      }
    };

    fetchDocument();

    return () => {
      collabSocket.off("connect");
      collabSocket.off("disconnect");
      collabSocket.off("pullUpdateResponse");
      collabSocket.off("pushUpdateResponse");
      collabSocket.off("getDocumentResponse");
    };
  }, []);

  if (editorState.version === null || editorState.doc === null) {
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
        langs.c(),
        // peerExtension(editorState.version),
        peerExtension(editorState.version, username),
        cursorExtension(username),
      ]}
      value={editorState.doc}
    />
  );
};

export default CodeEditor;
