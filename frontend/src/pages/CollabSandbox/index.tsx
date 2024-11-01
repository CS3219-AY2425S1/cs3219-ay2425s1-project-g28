import AppMargin from "../../components/AppMargin";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import classes from "./index.module.css";
import { useMatch } from "../../contexts/MatchContext";
import { USE_MATCH_ERROR_MESSAGE } from "../../utils/constants";
import { useEffect, useReducer, useState } from "react";
import Loader from "../../components/Loader";
import ServerError from "../../components/ServerError";
import reducer, {
  getQuestionById,
  initialState,
} from "../../reducers/questionReducer";
import QuestionDetailComponent from "../../components/QuestionDetail";
import { Navigate } from "react-router-dom";
import CodeEditor from "../../components/CodeEditor";
import { join, leave } from "../../utils/collabSocket";

const CollabSandbox: React.FC = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [showErrorScreen, setShowErrorScreen] = useState<boolean>(false);

  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }

  const {
    verifyMatchStatus,
    handleRejectEndSession,
    handleConfirmEndSession,
    matchUser,
    partner,
    matchCriteria,
    matchId,
    loading,
    isEndSessionModalOpen,
    questionId,
  } = match;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { selectedQuestion } = state;

  useEffect(() => {
    if (!partner) {
      return;
    }

    verifyMatchStatus();

    if (!questionId) {
      return;
    }
    getQuestionById(questionId, dispatch);

    if (!matchId || connected) {
      return;
    }

    const connectToCollabSession = async () => {
      try {
        await join(matchId);
        setConnected(true);
      } catch (error) {
        console.error("Error connecting to collab session: ", error);
      }
    };

    connectToCollabSession();

    return () => leave(matchId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let timeout: number | undefined;

    if (!selectedQuestion) {
      timeout = setTimeout(() => {
        setShowErrorScreen(true);
      }, 2000);
    } else {
      setShowErrorScreen(false);
    }

    return () => clearTimeout(timeout);
  }, [selectedQuestion]);

  if (loading) {
    return <Loader />;
  }

  if (!matchUser || !partner || !matchCriteria || !matchId) {
    return <Navigate to="/home" replace />;
  }

  if (showErrorScreen) {
    return (
      <ServerError
        title="Oops, match ended..."
        subtitle="Unfortunately, the match has ended due to a connection loss 😥"
      />
    );
  }

  if (!selectedQuestion || !connected) {
    return <Loader />;
  }

  return (
    <AppMargin classname={`${classes.fullheight} ${classes.flex}`}>
      <Dialog
        sx={{
          "& .MuiDialog-paper": {
            padding: "20px",
          },
        }}
        open={isEndSessionModalOpen}
        onClose={handleRejectEndSession}
      >
        <DialogTitle sx={{ textAlign: "center", fontSize: 20 }}>
          {"End Session?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: "center", fontSize: 16 }}>
            Are you sure you want to end session?
            <br />
            You will lose your current progress.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
            paddingBottom: "20px",
          }}
        >
          <Button
            sx={{
              width: "250px",
            }}
            variant="contained"
            color="secondary"
            onClick={handleRejectEndSession}
          >
            Back
          </Button>
          <Button
            sx={{
              width: "250px",
            }}
            variant="contained"
            onClick={handleConfirmEndSession}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", flex: 1 }}>
        <Box sx={(theme) => ({ flex: 1, marginRight: theme.spacing(2) })}>
          <QuestionDetailComponent
            title={selectedQuestion.title}
            description={selectedQuestion.description}
            complexity={selectedQuestion.complexity}
            categories={selectedQuestion.categories}
          />
        </Box>
        <Box sx={(theme) => ({ flex: 1, marginLeft: theme.spacing(2) })}>
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Box
              sx={(theme) => ({
                flex: 1,
                width: "100%",
                paddingTop: theme.spacing(2),
                paddingBottom: theme.spacing(2),
              })}
            >
              <CodeEditor
                uid={matchUser.id}
                username={matchUser.username}
                language={matchCriteria.language}
                template={
                  matchCriteria.language === "Python"
                    ? selectedQuestion.pythonTemplate
                    : matchCriteria.language === "Java"
                    ? selectedQuestion.javaTemplate
                    : matchCriteria.language === "C"
                    ? selectedQuestion.cTemplate
                    : ""
                }
                roomId={matchId}
              />
            </Box>
            <Box sx={{ flex: 1 }}>Test cases and chat tabs</Box>
          </Box>
        </Box>
      </Box>
    </AppMargin>
  );
};

export default CollabSandbox;
