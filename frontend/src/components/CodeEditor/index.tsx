import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { basicSetup } from "@uiw/codemirror-extensions-basic-setup";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { indentUnit } from "@codemirror/language";
import { useEffect, useState } from "react";
import { cursorExtension } from "../../utils/collabCursor";
import { yCollab } from "y-codemirror.next";
import { Doc, Text } from "yjs";
import { Awareness } from "y-protocols/awareness";
import { useCollab } from "../../contexts/CollabContext";
import {
  COLLAB_DOCUMENT_INIT_ERROR,
  USE_COLLAB_ERROR_MESSAGE,
} from "../../utils/constants";
import { toast } from "react-toastify";

interface CodeEditorProps {
  editorState?: { doc: Doc; text: Text; awareness: Awareness };
  language: string;
  template?: string;
  isReadOnly?: boolean;
}

const languageSupport = {
  Python: langs.python(),
  Java: langs.java(),
  C: langs.c(),
};

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { editorState, language, template = "", isReadOnly = false } = props;

  const collab = useCollab();
  if (!collab) {
    throw new Error(USE_COLLAB_ERROR_MESSAGE);
  }

  const {
    collabUser,
    collabPartner,
    roomId,
    qnId,
    qnTitle,
    initDocument,
    checkDocReady,
    sendCursorUpdate,
    receiveCursorUpdate,
  } = collab;

  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState<boolean>(false);

  const onEditorReady = (editor: ReactCodeMirrorRef) => {
    if (!isEditorReady && editor?.editor && editor?.state && editor?.view) {
      setIsEditorReady(true);
    }
  };

  useEffect(() => {
    if (isReadOnly || !isEditorReady || !editorState) {
      return;
    }

    const loadTemplate = async () => {
      if (collabUser && collabPartner && roomId && qnId && qnTitle) {
        checkDocReady(roomId, editorState.doc, setIsDocumentLoaded);
        try {
          await initDocument(
            roomId,
            template,
            collabUser.id,
            collabPartner.id,
            language,
            qnId,
            qnTitle
          );
          setIsDocumentLoaded(true);
        } catch {
          toast.error(COLLAB_DOCUMENT_INIT_ERROR);
        }
      } else {
        toast.error(COLLAB_DOCUMENT_INIT_ERROR);
      }
    };
    loadTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadOnly, isEditorReady, editorState]);

  return (
    <CodeMirror
      ref={onEditorReady}
      style={{ height: "100%", width: "100%", fontSize: "14px" }}
      height="100%"
      width="100%"
      basicSetup={false}
      id="codeEditor"
      extensions={[
        indentUnit.of("\t"),
        basicSetup(),
        languageSupport[language as keyof typeof languageSupport],
        ...(!isReadOnly && editorState && roomId && collabUser
          ? [
              yCollab(editorState.text, editorState.awareness),
              cursorExtension(
                roomId,
                collabUser.id,
                collabUser.username,
                sendCursorUpdate,
                receiveCursorUpdate
              ),
            ]
          : []),
        EditorView.lineWrapping,
        EditorView.editable.of(!isReadOnly && isDocumentLoaded),
        EditorState.readOnly.of(isReadOnly || !isDocumentLoaded),
      ]}
      value={isReadOnly ? template : undefined}
      placeholder={
        !isReadOnly && !isDocumentLoaded ? "Loading the code..." : undefined
      }
    />
  );
};

export default CodeEditor;
