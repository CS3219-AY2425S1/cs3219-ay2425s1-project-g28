/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState } from "react";
import {
  USE_MATCH_ERROR_MESSAGE,
  FAILED_TESTCASE_MESSAGE,
  SUCCESS_TESTCASE_MESSAGE,
  FAILED_TO_SUBMIT_CODE_MESSAGE,
} from "../utils/constants";
import { toast } from "react-toastify";

import { useMatch } from "./MatchContext";
import { codeExecutionClient } from "../utils/api";
import { useReducer } from "react";
import { updateQnHistoryById } from "../reducers/qnHistoryReducer";
import qnHistoryReducer, { initialQHState } from "../reducers/qnHistoryReducer";
import { leave } from "../utils/collabSocket";
import { CommunicationEvents } from "../components/Chat";
import { communicationSocket } from "../utils/communicationSocket";

type CompilerResult = {
  status: string;
  exception: string | null;
  stdout: string;
  stderr: string | null;
  executionTime: number;
  stdin: string;
  stout: string;
  actualResult: string;
  expectedResult: string;
};

type ContextContextType = {
  handleSubmitSessionClick: (time: number) => void;
  handleEndSessionClick: () => void;
  handleRejectEndSession: () => void;
  handleConfirmEndSession: () => void;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  compilerResult: CompilerResult[];
};

const CollabContext = createContext<ContextContextType | null>(null);

const CollabProvider: React.FC<{ children?: React.ReactNode }> = (props) => {
  const { children } = props;

  const match = useMatch();

  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }

  const {
    matchUser,
    partner,
    matchCriteria,
    getMatchId,
    stopMatch,
    questionId,
    qnHistoryId,
    setIsEndSessionModalOpen,
  } = match;

  // eslint-disable-next-line
  const [qnHistoryState, qnHistoryDispatch] = useReducer(
    qnHistoryReducer,
    initialQHState
  );
  const [code, setCode] = useState<string>("");
  const [compilerResult, setCompilerResult] = useState<CompilerResult[]>([]);

  const handleSubmitSessionClick = async (time: number) => {
    try {
      const res = await codeExecutionClient.post("/", {
        questionId,
        code,
        language: matchCriteria?.language.toLowerCase(),
      });

      setCompilerResult(res.data.data);

      let isMatch = true;
      for (let i = 0; i < res.data.data.length; i++) {
        if (!res.data.data[i].isMatch) {
          isMatch = false;
        }
        break;
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

  const handleConfirmEndSession = () => {
    setIsEndSessionModalOpen(false);

    // Leave collaboration room
    leave(matchUser?.id as string, getMatchId() as string);
    leave(partner?.id as string, getMatchId() as string);

    // Leave chat room
    communicationSocket.emit(
      CommunicationEvents.LEAVE,
      getMatchId(),
      matchUser?.username
    );
    communicationSocket.emit(
      CommunicationEvents.LEAVE,
      getMatchId(),
      partner?.username
    );

    // End match
    stopMatch();
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
      }}
    >
      {children}
    </CollabContext.Provider>
  );
};

export const useCollab = () => useContext(CollabContext);

export default CollabProvider;
