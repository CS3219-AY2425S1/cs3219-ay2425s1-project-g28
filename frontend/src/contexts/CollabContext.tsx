/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState } from "react";
import {
  USE_MATCH_ERROR_MESSAGE,
  FAILED_TESTCASE_MESSAGE,
  SUCCESS_TESTCASE_MESSAGE,
  FAILED_TO_SUBMIT_CODE_MESSAGE,
  COLLAB_END_ERROR,
} from "../utils/constants";
import { toast } from "react-toastify";

import { useMatch } from "./MatchContext";
import { codeExecutionClient } from "../utils/api";
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
  handleSubmitSessionClick: (time: number) => void;
  handleEndSessionClick: () => void;
  handleRejectEndSession: () => void;
  handleConfirmEndSession: (
    time: number,
    setTime: React.Dispatch<React.SetStateAction<number>>,
    setStopTime: React.Dispatch<React.SetStateAction<boolean>>,
    isInitiatedByPartner: boolean,
    sessionDuration?: number
  ) => void;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  compilerResult: CompilerResult[];
  setCompilerResult: React.Dispatch<React.SetStateAction<CompilerResult[]>>;
  isEndSessionModalOpen: boolean;
  resetCollab: () => void;
  checkDocReady: () => void;
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

  const { matchUser, matchCriteria, getMatchId, stopMatch, questionId } = match;

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
  const [qnHistoryId, setQnHistoryId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const handleSubmitSessionClick = async (time: number) => {
    try {
      const res = await codeExecutionClient.post("/", {
        questionId,
        // Replace tabs with 4 spaces to prevent formatting issues
        code: code.replace(/\t/g, " ".repeat(4)),
        language: matchCriteria?.language.toLowerCase(),
      });
      setHasSubmitted(true);
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
    time: number,
    setTime: React.Dispatch<React.SetStateAction<number>>,
    setStopTime: React.Dispatch<React.SetStateAction<boolean>>,
    isInitiatedByPartner: boolean,
    sessionDuration?: number
  ) => {
    setIsEndSessionModalOpen(false);

    const roomId = getMatchId();
    if (!matchUser || !roomId || !qnHistoryId) {
      toast.error(COLLAB_END_ERROR);
      return;
    }

    setStopTime(true);
    setIsExitSessionModalOpen(true);

    if (isInitiatedByPartner && sessionDuration) {
      setTime(sessionDuration);
    } else {
      // Get question history
      const data = await qnHistoryClient.get(qnHistoryId);

    // Only update question history if it has not been submitted before
    if (!hasSubmitted) {
      updateQnHistoryById(
        qnHistoryId as string,
        {
          submissionStatus: "Attempted",
          dateAttempted: new Date().toISOString(),
          timeTaken: time,
          code: code.replace(/\t/g, " ".repeat(4)),
        },
        qnHistoryDispatch
      );
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

  const checkDocReady = () => {
    collabSocket.on(CollabEvents.DOCUMENT_READY, (qnHistoryId: string) => {
      setQnHistoryId(qnHistoryId);
    });
  };

  const checkPartnerStatus = () => {
    collabSocket.on(CollabEvents.PARTNER_LEFT, () => {
      toast.error(COLLAB_ENDED_MESSAGE);
      setIsEndSessionModalOpen(false);
      stopMatch();
      appNavigate("/home");
    });
  };

  const resetCollab = () => {
    setCompilerResult([]);
  };

  return (
    <CollabContext.Provider
      value={{
        handleSubmitSessionClick,
        handleEndSessionClick,
        handleRejectEndSession,
        handleConfirmEndSession,
        setCode,
        compilerResult,
        setCompilerResult,
        isEndSessionModalOpen,
        resetCollab,
        checkDocReady,
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
