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
  COLLAB_PARTNER_DISCONNECTED_MESSAGE,
  COLLAB_ENDED_MESSAGE,
  COLLAB_END_ERROR,
} from "../utils/constants";
import { toast } from "react-toastify";

import { useMatch } from "./MatchContext";
import { qnHistoryClient, codeExecutionClient } from "../utils/api";
import { useReducer } from "react";
import { updateQnHistoryById } from "../reducers/qnHistoryReducer";
import qnHistoryReducer, { initialQHState } from "../reducers/qnHistoryReducer";
import { CollabEvents, collabSocket, leave } from "../utils/collabSocket";
import {
  CommunicationEvents,
  communicationSocket,
} from "../utils/communicationSocket";
import useAppNavigate from "../hooks/useAppNavigate";

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
  handleSubmitSessionClick: () => void;
  handleEndSessionClick: () => void;
  handleRejectEndSession: () => void;
  handleConfirmEndSession: (
    isInitiatedByPartner: boolean,
    time?: number
  ) => void;
  checkPartnerStatus: () => void;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  compilerResult: CompilerResult[];
  setCompilerResult: React.Dispatch<React.SetStateAction<CompilerResult[]>>;
  isEndSessionModalOpen: boolean;
  time: number;
  resetCollab: () => void;
  handleExitSession: () => void;
  isExitSessionModalOpen: boolean;
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
    matchUser,
    matchCriteria,
    getMatchId,
    stopMatch,
    questionId,
    qnHistoryId,
  } = match;

  // eslint-disable-next-line
  const [_qnHistoryState, qnHistoryDispatch] = useReducer(
    qnHistoryReducer,
    initialQHState
  );
  const [code, setCode] = useState<string>("");
  const [compilerResult, setCompilerResult] = useState<CompilerResult[]>([]);
  const [isEndSessionModalOpen, setIsEndSessionModalOpen] =
    useState<boolean>(false);
  const [isExitSessionModalOpen, setIsExitSessionModalOpen] =
    useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [stopTime, setStopTime] = useState<boolean>(true);

  const timeRef = useRef<number>(time);
  const codeRef = useRef<string>(code);

  useEffect(() => {
    timeRef.current = time;
    codeRef.current = code;
  }, [time, code]);

  useEffect(() => {
    if (stopTime) {
      return;
    }

    const intervalId = setInterval(
      () => setTime((prevTime) => prevTime + 1),
      1000
    );

    return () => clearInterval(intervalId);
  }, [time, stopTime]);

  const handleSubmitSessionClick = async () => {
    try {
      const res = await codeExecutionClient.post("/", {
        questionId,
        // Replace tabs with 4 spaces to prevent formatting issues
        code: code.replace(/\t/g, " ".repeat(4)),
        language: matchCriteria?.language.toLowerCase(),
      });
      console.log([...res.data.data]);
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

      updateQnHistoryById(
        qnHistoryId as string,
        {
          submissionStatus: isMatch ? "Accepted" : "Rejected",
          dateAttempted: new Date().toISOString(),
          timeTaken: time,
          code,
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
    isInitiatedByPartner: boolean,
    timeTaken?: number
  ) => {
    setIsEndSessionModalOpen(false);

    const roomId = getMatchId();
    if (!matchUser || !roomId || !qnHistoryId) {
      toast.error(COLLAB_END_ERROR);
      return;
    }

    setStopTime(true);
    setIsExitSessionModalOpen(true);

    if (isInitiatedByPartner && timeTaken) {
      setTime(timeTaken);
    } else {
      // Get question history
      const data = await qnHistoryClient.get(qnHistoryId);

      // Only update question history if it has not been submitted before
      if (!data.data.qnHistory.code) {
        updateQnHistoryById(
          qnHistoryId as string,
          {
            submissionStatus: "Attempted",
            dateAttempted: new Date().toISOString(),
            timeTaken: timeRef.current,
            code: codeRef.current.replace(/\t/g, " ".repeat(4)),
          },
          qnHistoryDispatch
        );
      }
    }

    if (!isInitiatedByPartner) {
      // Notify partner
      collabSocket.emit(CollabEvents.END_SESSION_REQUEST, roomId, time);
    }

    // Leave collaboration room
    leave(matchUser.id, roomId, true);

    // Leave chat room
    communicationSocket.emit(CommunicationEvents.USER_DISCONNECT);
  };

  const handleExitSession = () => {
    setIsExitSessionModalOpen(false);

    // Delete match data
    stopMatch();
    appNavigate("/home");

    // Reset collab state
    resetCollab();
  };

  const checkPartnerStatus = () => {
    collabSocket.once(CollabEvents.END_SESSION, (timeTaken: number) => {
      collabSocket.off(CollabEvents.PARTNER_DISCONNECTED);
      toast.info(COLLAB_ENDED_MESSAGE);
      handleConfirmEndSession(true, timeTaken);
    });

    collabSocket.once(CollabEvents.PARTNER_DISCONNECTED, () => {
      collabSocket.off(CollabEvents.END_SESSION);
      toast.error(COLLAB_PARTNER_DISCONNECTED_MESSAGE);
      handleConfirmEndSession(true);
    });
  };

  const resetCollab = () => {
    setCompilerResult([]);
    setTime(0);
    setStopTime(false);
  };

  return (
    <CollabContext.Provider
      value={{
        handleSubmitSessionClick,
        handleEndSessionClick,
        handleRejectEndSession,
        handleConfirmEndSession,
        checkPartnerStatus,
        setCode,
        compilerResult,
        setCompilerResult,
        isEndSessionModalOpen,
        time,
        resetCollab,
        handleExitSession,
        isExitSessionModalOpen,
      }}
    >
      {children}
    </CollabContext.Provider>
  );
};

export const useCollab = () => useContext(CollabContext);

export default CollabProvider;
