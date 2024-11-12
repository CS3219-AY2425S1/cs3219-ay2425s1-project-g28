/* eslint-disable react-refresh/only-export-components */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  USE_MATCH_ERROR_MESSAGE,
  FAILED_TESTCASE_MESSAGE,
  SUCCESS_TESTCASE_MESSAGE,
  FAILED_TO_SUBMIT_CODE_MESSAGE,
  COLLAB_END_ERROR,
  COLLAB_SUBMIT_ERROR,
  COLLAB_DOCUMENT_ERROR,
  COLLAB_DOCUMENT_RESTORED,
  COLLAB_RECONNECTION_ERROR,
} from "../utils/constants";
import { toast } from "react-toastify";

import { useMatch } from "./MatchContext";
import { codeExecutionClient, qnHistoryClient } from "../utils/api";
import { useReducer } from "react";
import { updateQnHistoryById } from "../reducers/qnHistoryReducer";
import qnHistoryReducer, { initialQHState } from "../reducers/qnHistoryReducer";
import { createCollabSocket } from "../utils/collabSocket";
import useAppNavigate from "../hooks/useAppNavigate";
import { applyUpdateV2, Doc, Text } from "yjs";
import { Socket } from "socket.io-client";
import { Awareness } from "y-protocols/awareness.js";
import { Cursor, updateCursor } from "../utils/collabCursor";
import { EditorView } from "@uiw/react-codemirror";
import { createCommunicationSocket } from "../utils/communicationSocket";

export enum CollabEvents {
  // Send
  JOIN = "join",
  LEAVE = "leave",
  INIT_DOCUMENT = "init_document",
  UPDATE_REQUEST = "update_request",
  UPDATE_CURSOR_REQUEST = "update_cursor_request",
  RECONNECT_REQUEST = "reconnect_request",
  END_SESSION_REQUEST = "end_session_request",

  // Receive
  ROOM_READY = "room_ready",
  DOCUMENT_READY = "document_ready",
  DOCUMENT_NOT_FOUND = "document_not_found",
  UPDATE = "updateV2",
  UPDATE_CURSOR = "update_cursor",
  END_SESSION = "end_session",
  PARTNER_DISCONNECTED = "partner_disconnected",

  SOCKET_DISCONNECT = "disconnect",
  SOCKET_CLIENT_DISCONNECT = "io client disconnect",
  SOCKET_SERVER_DISCONNECT = "io server disconnect",
  SOCKET_RECONNECT_SUCCESS = "reconnect",
  SOCKET_RECONNECT_FAILED = "reconnect_failed",
}

export type CollabSessionData = {
  ready: boolean;
  doc: Doc;
  text: Text;
  awareness: Awareness;
};

export type CompilerResult = {
  status: string;
  exception: string | null;
  stdout: string;
  stderr: string | null;
  executionTime: number;
  stdin: string;
  stout: string;
  actualResult: string;
  expectedResult: string;
  isMatch: boolean;
};

type CollabContextType = {
  collabSocket: Socket | null;
  communicationSocket: Socket | null;
  join: (uid: string, roomId: string) => Promise<CollabSessionData>;
  initDocument: (
    uid: string,
    roomId: string,
    template: string,
    uid1: string,
    uid2: string,
    language: string,
    qnId: string,
    qnTitle: string
  ) => Promise<void>;
  leave: (uid: string, roomId: string, isPartnerNotified: boolean) => void;
  sendCursorUpdate: (roomId: string, cursor: Cursor) => void;
  receiveCursorUpdate: (view: EditorView) => void;
  handleSubmitSessionClick: (time: number) => void;
  handleEndSessionClick: () => void;
  handleRejectEndSession: () => void;
  handleConfirmEndSession: (
    time: number,
    setTime: React.Dispatch<React.SetStateAction<number>>,
    isInitiatedByPartner: boolean,
    sessionDuration?: number
  ) => void;
  isEndSessionModalOpen: boolean;
  compilerResult: CompilerResult[];
  setCompilerResult: React.Dispatch<React.SetStateAction<CompilerResult[]>>;
  resetCollab: () => void;
  checkDocReady: (
    roomId: string,
    doc: Doc,
    setIsDocumentLoaded: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  handleExitSession: () => void;
  isExitSessionModalOpen: boolean;
  qnHistoryId: string | null;
  stopTime: boolean;
  setStopTime: React.Dispatch<React.SetStateAction<boolean>>;
};

const CollabContext = createContext<CollabContextType | null>(null);

const CollabProvider: React.FC<{ children?: React.ReactNode }> = (props) => {
  const { children } = props;
  const appNavigate = useAppNavigate();

  const match = useMatch();

  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }

  const { matchUser, matchCriteria, getMatchId, stopMatch, questionId } = match;

  // eslint-disable-next-line
  const [_qnHistoryState, qnHistoryDispatch] = useReducer(
    qnHistoryReducer,
    initialQHState
  );

  const [compilerResult, setCompilerResult] = useState<CompilerResult[]>([]);
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] =
    useState<boolean>(false);
  const [isExitSessionModalOpen, setIsExitSessionModalOpen] =
    useState<boolean>(false);
  const [qnHistoryId, setQnHistoryId] = useState<string | null>(null);
  const [stopTime, setStopTime] = useState<boolean>(true);
  const [collabSessionData, setCollabSessionData] =
    useState<CollabSessionData | null>(null);

  // sockets
  const [collabSocket, setCollabSocket] = useState<Socket | null>(null);
  const [communicationSocket, setCommunicationSocket] = useState<Socket | null>(
    null
  );

  // refs
  const collabSessionDataRef = useRef<CollabSessionData | null>(null);
  const qnHistoryIdRef = useRef<string | null>(qnHistoryId);

  useEffect(() => {
    if (matchUser) {
      setCollabSocket(createCollabSocket());
      setCommunicationSocket(createCommunicationSocket());
    } else {
      setCollabSocket(null);
      setCommunicationSocket(null);
    }
  }, [matchUser]);

  useEffect(() => {
    collabSessionDataRef.current = collabSessionData;
  }, [collabSessionData]);

  useEffect(() => {
    qnHistoryIdRef.current = qnHistoryId;
  }, [qnHistoryId]);

  const join = (uid: string, roomId: string): Promise<CollabSessionData> => {
    collabSocket?.connect();

    const doc = new Doc();
    const text = doc.getText();
    const awareness = new Awareness(doc);
    setCollabSessionData({
      ready: false,
      doc: doc,
      text: text,
      awareness: awareness,
    });

    doc.on(CollabEvents.UPDATE, (update, origin) => {
      if (origin !== uid) {
        collabSocket?.emit(CollabEvents.UPDATE_REQUEST, roomId, update);
      }
    });

    collabSocket?.on(CollabEvents.UPDATE, (update) => {
      applyUpdateV2(doc, new Uint8Array(update), uid);
    });

    collabSocket?.emit(CollabEvents.JOIN, uid, roomId);

    return new Promise((resolve) => {
      collabSocket?.once(CollabEvents.ROOM_READY, (ready: boolean) => {
        resolve({ ready: ready, doc: doc, text: text, awareness: awareness });
      });
    });
  };

  const initDocument = (
    uid: string,
    roomId: string,
    template: string,
    uid1: string,
    uid2: string,
    language: string,
    qnId: string,
    qnTitle: string
  ) => {
    collabSocket?.emit(
      CollabEvents.INIT_DOCUMENT,
      roomId,
      template,
      uid1,
      uid2,
      language,
      qnId,
      qnTitle
    );

    return new Promise<void>((resolve, reject) => {
      collabSocket?.once(CollabEvents.UPDATE, (update) => {
        if (collabSessionDataRef.current) {
          applyUpdateV2(
            collabSessionDataRef.current.doc,
            new Uint8Array(update),
            uid
          );
          resolve();
        } else {
          reject();
        }
      });
    });
  };

  const leave = (uid: string, roomId: string, isPartnerNotified: boolean) => {
    collabSocket?.removeAllListeners();
    collabSocket?.io.removeListener(CollabEvents.SOCKET_RECONNECT_SUCCESS);
    collabSocket?.io.removeListener(CollabEvents.SOCKET_RECONNECT_FAILED);
    collabSessionDataRef.current?.doc.destroy();

    if (collabSocket?.connected) {
      collabSocket.emit(CollabEvents.LEAVE, uid, roomId, isPartnerNotified);
    }
  };

  const sendCursorUpdate = (roomId: string, cursor: Cursor) => {
    collabSocket?.emit(CollabEvents.UPDATE_CURSOR_REQUEST, roomId, cursor);
  };

  const receiveCursorUpdate = (view: EditorView) => {
    if (collabSocket?.hasListeners(CollabEvents.UPDATE_CURSOR)) {
      return;
    }

    collabSocket?.on(CollabEvents.UPDATE_CURSOR, (cursor: Cursor) => {
      view.dispatch({
        effects: updateCursor.of(cursor),
      });
    });
  };

  const getDocContent = () => {
    const doc = collabSessionDataRef.current?.doc;
    return doc && !doc.isDestroyed
      ? doc.getText().toString().replace(/\t/g, " ".repeat(4)) // Replace tabs with 4 spaces to prevent formatting issues
      : "";
  };

  const handleSubmitSessionClick = async (time: number) => {
    const code = getDocContent();
    try {
      const res = await codeExecutionClient.post("/", {
        questionId,
        code: code,
        language: matchCriteria?.language.toLowerCase(),
      });
      setCompilerResult([...res.data.data]);

      let isMatch = true;
      for (let i = 0; i < res.data.data.length; i++) {
        if (!res.data.data[i].isMatch) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        toast.success(SUCCESS_TESTCASE_MESSAGE);
      } else {
        toast.error(FAILED_TESTCASE_MESSAGE);
      }

      if (!qnHistoryIdRef.current) {
        toast.error(COLLAB_SUBMIT_ERROR);
        return;
      }

      updateQnHistoryById(
        qnHistoryIdRef.current,
        {
          submissionStatus: isMatch ? "Accepted" : "Rejected",
          dateAttempted: new Date().toISOString(),
          timeTaken: time,
          code: code,
        },
        qnHistoryDispatch
      );
    } catch {
      toast.error(FAILED_TO_SUBMIT_CODE_MESSAGE);
    }
  };

  const handleEndSessionClick = () => {
    setIsEndSessionModalOpen(true);
  };

  const handleRejectEndSession = () => {
    setIsEndSessionModalOpen(false);
  };

  const handleConfirmEndSession = async (
    time: number,
    setTime: React.Dispatch<React.SetStateAction<number>>,
    isInitiatedByPartner: boolean,
    sessionDuration?: number
  ) => {
    setIsEndSessionModalOpen(false);

    const roomId = getMatchId();
    if (!matchUser || !roomId || !qnHistoryIdRef.current) {
      toast.error(COLLAB_END_ERROR);
      appNavigate("/home");
      return;
    }

    setStopTime(true);
    setIsExitSessionModalOpen(true);

    if (isInitiatedByPartner && sessionDuration) {
      setTime(sessionDuration);
    } else {
      // Get question history
      const data = await qnHistoryClient.get(qnHistoryIdRef.current);

      // Only update question history if it has not been submitted before
      if (data.data.qnHistory.timeTaken === 0) {
        const code = getDocContent();

        updateQnHistoryById(
          qnHistoryIdRef.current,
          {
            submissionStatus: "Attempted",
            dateAttempted: new Date().toISOString(),
            timeTaken: time,
            code: code,
          },
          qnHistoryDispatch
        );
      }
    }

    if (!isInitiatedByPartner) {
      // Notify partner
      collabSocket?.emit(CollabEvents.END_SESSION_REQUEST, roomId, time);
    }

    // Leave collaboration room
    leave(matchUser.id, roomId, true);
  };

  const handleExitSession = () => {
    // Delete match data
    stopMatch();
    appNavigate("/home");

    // Reset collab state
    resetCollab();
  };

  const checkDocReady = (
    roomId: string,
    doc: Doc,
    setIsDocumentLoaded: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!collabSocket?.hasListeners(CollabEvents.DOCUMENT_READY)) {
      collabSocket?.on(CollabEvents.DOCUMENT_READY, (qnHistoryId: string) => {
        setQnHistoryId(qnHistoryId);
      });
    }

    if (!collabSocket?.hasListeners(CollabEvents.DOCUMENT_NOT_FOUND)) {
      collabSocket?.on(CollabEvents.DOCUMENT_NOT_FOUND, () => {
        toast.error(COLLAB_DOCUMENT_ERROR);
        setIsDocumentLoaded(false);
        setStopTime(true);

        const text = doc.getText();
        doc.transact(() => {
          text.delete(0, text.length);
        }, matchUser?.id);

        collabSocket.once(CollabEvents.UPDATE, (update) => {
          applyUpdateV2(doc, new Uint8Array(update), matchUser?.id);
          toast.success(COLLAB_DOCUMENT_RESTORED);
          setIsDocumentLoaded(true);
          setStopTime(false);
        });

        collabSocket.emit(CollabEvents.RECONNECT_REQUEST, roomId);
      });
    }

    if (!collabSocket?.hasListeners(CollabEvents.SOCKET_DISCONNECT)) {
      collabSocket?.on(CollabEvents.SOCKET_DISCONNECT, (reason) => {
        console.log(reason);
        if (
          reason !== CollabEvents.SOCKET_CLIENT_DISCONNECT &&
          reason !== CollabEvents.SOCKET_SERVER_DISCONNECT
        ) {
          toast.error(COLLAB_DOCUMENT_ERROR);
          setIsDocumentLoaded(false);
          setStopTime(true);
        }
      });
    }

    if (!collabSocket?.io.hasListeners(CollabEvents.SOCKET_RECONNECT_SUCCESS)) {
      collabSocket?.io.on(CollabEvents.SOCKET_RECONNECT_SUCCESS, () => {
        const text = doc.getText();
        doc.transact(() => {
          text.delete(0, text.length);
        }, matchUser?.id);

        collabSocket.once(CollabEvents.UPDATE, (update) => {
          applyUpdateV2(doc, new Uint8Array(update), matchUser?.id);
          toast.success(COLLAB_DOCUMENT_RESTORED);
          setIsDocumentLoaded(true);
          setStopTime(false);
        });

        collabSocket.emit(CollabEvents.RECONNECT_REQUEST, roomId);
      });
    }

    if (!collabSocket?.io.hasListeners(CollabEvents.SOCKET_RECONNECT_FAILED)) {
      collabSocket?.io.on(CollabEvents.SOCKET_RECONNECT_FAILED, () => {
        toast.error(COLLAB_RECONNECTION_ERROR);

        if (matchUser) {
          leave(matchUser.id, roomId, true);
        }

        handleExitSession();
      });
    }
  };

  const resetCollab = () => {
    setCompilerResult([]);
    setIsEndSessionModalOpen(false);
    setIsExitSessionModalOpen(false);
    setQnHistoryId(null);
    setCollabSessionData(null);
  };

  return (
    <CollabContext.Provider
      value={{
        collabSocket,
        communicationSocket,
        join,
        initDocument,
        leave,
        sendCursorUpdate,
        receiveCursorUpdate,
        handleSubmitSessionClick,
        handleEndSessionClick,
        handleRejectEndSession,
        handleConfirmEndSession,
        isEndSessionModalOpen,
        compilerResult,
        setCompilerResult,
        resetCollab,
        checkDocReady,
        handleExitSession,
        isExitSessionModalOpen,
        qnHistoryId,
        stopTime,
        setStopTime,
      }}
    >
      {children}
    </CollabContext.Provider>
  );
};

export const useCollab = () => useContext(CollabContext);

export default CollabProvider;
