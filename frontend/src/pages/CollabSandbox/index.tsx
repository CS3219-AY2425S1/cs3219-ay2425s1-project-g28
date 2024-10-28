import AppMargin from "../../components/AppMargin";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tab,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
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

      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Left side */}
        <Box sx={(theme) => ({ flex: 1, marginRight: theme.spacing(2) })}>
          <QuestionDetailComponent
            title={selectedQuestion.title}
            description={selectedQuestion.description}
            complexity={selectedQuestion.complexity}
            categories={selectedQuestion.categories}
          />
        </Box>
        {/* Right side */}
        <Box
          sx={(theme) => ({
            flex: 1,
            marginLeft: theme.spacing(2),
            display: "flex",
            flexDirection: "column",
          })}
        >
          <Box sx={{ flex: 1, maxHeight: "50%" }}>Code editor</Box>
          <Box
            sx={{
              flex: 1,
              maxHeight: "50%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TabContext value={selectedTab}>
              <Box sx={{ maxHeight: "100%" }}>
                <TabList onChange={(_, value) => setSelectedTab(value)}>
                  <Tab label="Test cases" value={"tests"} />
                  <Tab label="Chat" value={"chat"} />
                </TabList>
              </Box>
              <TabPanel value={"tests"} sx={{ flex: 1, maxHeight: "100%" }}>
                Tests
              </TabPanel>
              <TabPanel
                value={"chat"}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "100%",
                }}
              >
                <Chat />
              </TabPanel>
            </TabContext>
          </Box>
        </Box>
      </Box>
    </AppMargin>
  );
};

export default CollabSandbox;
