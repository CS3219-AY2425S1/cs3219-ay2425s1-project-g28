import AppMargin from "../../components/AppMargin";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2,
  Tab,
  Tabs,
  Typography,
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
import Chat from "../../components/Chat";
import TabPanel from "../../components/TabPanel";

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
  const [selectedTab, setSelectedTab] = useState<"tests" | "chat">("tests");

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
      <Grid2 container sx={{ flexGrow: 1 }} spacing={4}>
        <Grid2 sx={{ flexGrow: 1 }} size={6}>
          <QuestionDetailComponent
            title={selectedQuestion.title}
            description={selectedQuestion.description}
            complexity={selectedQuestion.complexity}
            categories={selectedQuestion.categories}
          />
        </Grid2>
        <Grid2
          sx={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "100%",
          }}
          size={6}
        >
          <Box sx={{ flex: 1, maxHeight: "50vh" }}>Code Editor</Box>
          <Box sx={{ flex: 1, maxHeight: "50vh", overflow: "auto" }}>
            <Tabs
              value={selectedTab}
              onChange={(_, value) => setSelectedTab(value)}
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "white",
              }}
            >
              <Tab label="Test Cases" value="tests" />
              <Tab label="Chat" value="chat" />
            </Tabs>
            <TabPanel selected={selectedTab} value="tests">
              <Typography>Tests</Typography>
            </TabPanel>
            <TabPanel
              selected={selectedTab}
              value="chat"
              sx={(theme) => ({
                padding: theme.spacing(2),
                height: "100%",
                display: "flex",
                flexDirection: "column",
              })}
            >
              <Chat />
            </TabPanel>
          </Box>
        </Grid2>
      </Grid2>
    </AppMargin>
  );
};

export default CollabSandbox;
