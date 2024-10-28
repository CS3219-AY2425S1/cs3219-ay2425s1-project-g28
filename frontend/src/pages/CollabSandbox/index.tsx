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
import { useEffect, useReducer } from "react";
import Loader from "../../components/Loader";
import ServerError from "../../components/ServerError";
import reducer, {
  getQuestionById,
  initialState,
} from "../../reducers/questionReducer";
import QuestionDetailComponent from "../../components/QuestionDetail";

const CollabSandbox: React.FC = () => {
  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }

  const {
    verifyMatchStatus,
    getMatchId,
    handleRejectEndSession,
    handleConfirmEndSession,
    partner,
    loading,
    isEndSessionModalOpen,
    questionId,
  } = match;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { selectedQuestion } = state;

  useEffect(() => {
    verifyMatchStatus();

    if (!questionId) {
      return;
    }
    getQuestionById(questionId, dispatch);

    // TODO
    // use getMatchId() as the room id in the collab service
    console.log(getMatchId());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!partner || !questionId || !selectedQuestion) {
    return (
      <ServerError
        title="Oops, match ended..."
        subtitle="Unfortunately, the match has ended due to a connection loss 😥"
      />
    );
  }

  return (
    <AppMargin classname={`${classes.fullheight} ${classes.flex}`}>
      {/* <Stack spacing={2} alignItems={"center"}>
        <Typography variant="h1">Successfully matched!</Typography>
      </Stack> */}
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
            <Box sx={{ flex: 1 }}>Code editor</Box>
            <Box sx={{ flex: 1 }}>Test cases and chat tabs</Box>
          </Box>
        </Box>
      </Box>
    </AppMargin>
  );
};

export default CollabSandbox;
