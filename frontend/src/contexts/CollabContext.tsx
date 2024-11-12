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
import { CollabEvents, createCollabSocket } from "../utils/collabSocket";
import useAppNavigate from "../hooks/useAppNavigate";
import { applyUpdateV2, Doc, Text } from "yjs";
import { Socket } from "socket.io-client";
import { Awareness } from "y-protocols/awareness.js";
import { Cursor, updateCursor } from "../utils/collabCursor";
import { EditorView } from "@uiw/react-codemirror";
import { createCommunicationSocket } from "../utils/communicationSocket";

type CollabUser = {
  id: string;
  username: string;
};

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
  // Sockets
  collabSocket: Socket | null;
  communicationSocket: Socket | null;

  // Real-time logic
  join: (uid: string, roomId: string) => Promise<CollabSessionData>;
  leave: (uid: string, roomId: string, isPartnerNotified: boolean) => void;
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
  checkDocReady: (
    roomId: string,
    doc: Doc,
    setIsDocumentLoaded: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
  sendCursorUpdate: (roomId: string, cursor: Cursor) => void;
  receiveCursorUpdate: (view: EditorView) => void;

  // End session logic
  handleSubmitSessionClick: (time: number) => void;
  handleEndSessionClick: () => void;
  handleRejectEndSession: () => void;
  handleConfirmEndSession: (
    time: number,
    setTime: React.Dispatch<React.SetStateAction<number>>,
    isInitiatedByPartner: boolean,
    sessionDuration?: number
  ) => void;
  handleExitSession: () => void;
  isEndSessionModalOpen: boolean;
  isExitSessionModalOpen: boolean;

  // Collab session data
  collabUser: CollabUser | null;
  collabPartner: CollabUser | null;
  language: string | null;
  roomId: string | null;
  qnId: string | null;
  qnTitle: string | null;
  qnHistoryId: string | null;
  compilerResult: CompilerResult[];
  stopTime: boolean;
  setStopTime: React.Dispatch<React.SetStateAction<boolean>>;
  resetCollab: () => void;
};

const CollabContext = createContext<CollabContextType | null>(null);

const CollabProvider: React.FC<{ children?: React.ReactNode }> = (props) => {
  const { children } = props;
  const appNavigate = useAppNavigate();

  const match = useMatch();

  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }

  const {
    matchId,
    matchUser,
    matchCriteria,
    partner,
    questionId,
    questionTitle,
    stopMatch,
  } = match;

  // eslint-disable-next-line
  const [_qnHistoryState, qnHistoryDispatch] = useReducer(
    qnHistoryReducer,
    initialQHState
  );

  // Sockets
  const [collabSocket, setCollabSocket] = useState<Socket | null>(null);
  const [communicationSocket, setCommunicationSocket] = useState<Socket | null>(
    null
  );

  // Session data
  const [collabUser, setCollabUser] = useState<CollabUser | null>(null);
  const [collabPartner, setCollabPartner] = useState<CollabUser | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [qnId, setQnId] = useState<string | null>(null);
  const [qnTitle, setQnTitle] = useState<string | null>(null);
  const [qnHistoryId, setQnHistoryId] = useState<string | null>(null);
  const [compilerResult, setCompilerResult] = useState<CompilerResult[]>([]);
  const [stopTime, setStopTime] = useState<boolean>(true);
  const [collabSessionData, setCollabSessionData] =
    useState<CollabSessionData | null>(null);

  // Refs
  const collabSessionDataRef = useRef<CollabSessionData | null>(null);
  const qnHistoryIdRef = useRef<string | null>(qnHistoryId);

  // Modals
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] =
    useState<boolean>(false);
  const [isExitSessionModalOpen, setIsExitSessionModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    if (matchUser) {
      setCollabUser({
        id: matchUser.id,
        username: matchUser.username,
      });
      setCollabSocket(createCollabSocket());
      setCommunicationSocket(createCommunicationSocket());
    } else {
      setCollabSocket(null);
      setCommunicationSocket(null);
    }
  }, [matchUser]);

  useEffect(() => {
    setCollabPartner(
      partner
        ? {
            id: partner.id,
            username: partner.username,
          }
        : null
    );
    setLanguage(matchCriteria?.language || null);
    setRoomId(matchId);
    setQnId(questionId);
    setQnTitle(questionTitle);
  }, [partner, matchCriteria, matchId, questionId, questionTitle]);

  useEffect(() => {
    qnHistoryIdRef.current = qnHistoryId;
  }, [qnHistoryId]);

  useEffect(() => {
    collabSessionDataRef.current = collabSessionData;
  }, [collabSessionData]);

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

  const leave = (uid: string, roomId: string, isPartnerNotified: boolean) => {
    collabSocket?.removeAllListeners();
    collabSocket?.io.removeListener(CollabEvents.SOCKET_RECONNECT_SUCCESS);
    collabSocket?.io.removeListener(CollabEvents.SOCKET_RECONNECT_FAILED);
    collabSessionDataRef.current?.doc.destroy();

    if (collabSocket?.connected) {
      collabSocket.emit(CollabEvents.LEAVE, uid, roomId, isPartnerNotified);
    }
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
        }, collabUser?.id);

        collabSocket.once(CollabEvents.UPDATE, (update) => {
          applyUpdateV2(doc, new Uint8Array(update), collabUser?.id);
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
        }, collabUser?.id);

        collabSocket.once(CollabEvents.UPDATE, (update) => {
          applyUpdateV2(doc, new Uint8Array(update), collabUser?.id);
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

        if (collabUser) {
          leave(collabUser.id, roomId, true);
        }

        handleExitSession();
      });
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
        questionId: qnId,
        code: code,
        language: language?.toLowerCase(),
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

    if (!collabUser || !roomId || !qnHistoryIdRef.current) {
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
    leave(collabUser.id, roomId, true);
  };

  const handleExitSession = () => {
    // Delete match data
    stopMatch();
    appNavigate("/home");

    // Reset collab state
    resetCollab();
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
        // Sockets
        collabSocket,
        communicationSocket,

        // Real-time logic
        join,
        leave,
        initDocument,
        checkDocReady,
        sendCursorUpdate,
        receiveCursorUpdate,

        // End session logic
        handleSubmitSessionClick,
        handleEndSessionClick,
        handleRejectEndSession,
        handleConfirmEndSession,
        handleExitSession,
        isEndSessionModalOpen,
        isExitSessionModalOpen,

        // Collab session data
        collabUser,
        collabPartner,
        language,
        roomId,
        qnId,
        qnTitle,
        qnHistoryId,
        compilerResult,
        stopTime,
        setStopTime,
        resetCollab,
      }}
    >
      {children}
    </CollabContext.Provider>
  );
};

export const useCollab = () => useContext(CollabContext);

export default CollabProvider;
