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
import { Navigate } from "react-router-dom";
import Chat from "../../components/Chat";
import TabPanel from "../../components/TabPanel";

const CollabSandbox: React.FC = () => {
  const [showErrorScreen, setShowErrorScreen] = useState<boolean>(false);

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
    if (!partner) {
      return;
    }

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

  if (!partner) {
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

  if (!selectedQuestion) {
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
          <Box
            sx={{
              flex: 1,
              maxHeight: "50vh",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Tabs
              value={selectedTab}
              onChange={(_, value) => setSelectedTab(value)}
              sx={(theme) => ({
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "white",
                borderBottom: `1px solid ${theme.palette.divider}`,
              })}
            >
              <Tab label="Test Cases" value="tests" />
              <Tab label="Chat" value="chat" />
            </Tabs>
            <TabPanel selected={selectedTab} value="tests">
              <Typography>Tests</Typography>
            </TabPanel>
            <TabPanel selected={selectedTab} value="chat">
              <Chat isActive={selectedTab === "chat"} />
            </TabPanel>
          </Box>
        </Grid2>
      </Grid2>
    </AppMargin>
  );
};

export default CollabSandbox;
