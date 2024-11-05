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
} from "@mui/material";
import classes from "./index.module.css";
import { useCollab } from "../../contexts/CollabContext";
import { useMatch } from "../../contexts/MatchContext";
import {
  USE_COLLAB_ERROR_MESSAGE,
  USE_MATCH_ERROR_MESSAGE,
} from "../../utils/constants";
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
import TestCase from "../../components/TestCase";
import CodeEditor from "../../components/CodeEditor";
import { CollabSessionData, join, leave } from "../../utils/collabSocket";

// hardcode for now...

type TestCase = {
  input: string;
  output: string;
  stdout: string;
  result: string;
};

const testcases: TestCase[] = [
  {
    input: "1 2 3 4",
    output: "1 2 3 4",
    stdout: "1\n2\n3\n4",
    result: "1 2 3 4",
  },
  {
    input: "5 6 7 8",
    output: "5 6 7 8",
    stdout: "5\n6\n7\n8",
    result: "5 6 7 8",
  },
];

const CollabSandbox: React.FC = () => {
  const [showErrorScreen, setShowErrorScreen] = useState<boolean>(false);
  const [editorState, setEditorState] = useState<CollabSessionData | null>(
    null
  );

  const match = useMatch();
  if (!match) {
    throw new Error(USE_MATCH_ERROR_MESSAGE);
  }

  const {
    verifyMatchStatus,
    getMatchId,
    matchUser,
    partner,
    matchCriteria,
    loading,
    isEndSessionModalOpen,
    questionId,
  } = match;

  const collab = useCollab();
  if (!collab) {
    throw new Error(USE_COLLAB_ERROR_MESSAGE);
  }

  const { handleRejectEndSession, handleConfirmEndSession } = collab;

  const [state, dispatch] = useReducer(reducer, initialState);
  const { selectedQuestion } = state;
  const [selectedTab, setSelectedTab] = useState<"tests" | "chat">("tests");
  const [selectedTestcase, setSelectedTestcase] = useState(0);

  useEffect(() => {
    if (!partner) {
      return;
    }

    verifyMatchStatus();

    if (!questionId) {
      return;
    }
    getQuestionById(questionId, dispatch);

    const matchId = getMatchId();
    if (!matchUser || !matchId) {
      return;
    }

    const connectToCollabSession = async () => {
      try {
        const editorState = await join(matchUser.id, matchId);
        if (editorState.ready) {
          setEditorState(editorState);
        } else {
          setShowErrorScreen(true);
        }
      } catch (error) {
        console.error("Error connecting to collab session: ", error);
      }
    };

    connectToCollabSession();

    return () => leave(matchUser.id, matchId);

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

  if (!matchUser || !partner || !matchCriteria || !getMatchId()) {
    return <Navigate to="/home" replace />;
  }

  if (showErrorScreen) {
    return (
      <ServerError
        title="Oops, collaboration session ended..."
        subtitle="Unfortunately, the session has ended due to a connection loss 😥"
      />
    );
  }

  if (!selectedQuestion || !editorState) {
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
          <Box
            sx={(theme) => ({
              flex: 1,
              width: "100%",
              minHeight: "44vh",
              maxHeight: "44vh",
              paddingTop: theme.spacing(2),
              paddingBottom: theme.spacing(2),
            })}
          >
            <CodeEditor
              editorState={editorState}
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
              roomId={getMatchId()!}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              maxHeight: "44vh",
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

            <TabPanel value={selectedTab} selected="tests">
              <Box sx={(theme) => ({ margin: theme.spacing(2, 0) })}>
                {[...Array(testcases.length)]
                  .map((_, index) => index + 1)
                  .map((i) => (
                    <Button
                      key={i}
                      variant="contained"
                      color={
                        selectedTestcase === i - 1 ? "primary" : "secondary"
                      }
                      onClick={() => setSelectedTestcase(i - 1)}
                      sx={(theme) => ({ margin: theme.spacing(0, 1) })}
                    >
                      Testcase {i}
                    </Button>
                  ))}
              </Box>
              <TestCase
                input={testcases[selectedTestcase].input}
                output={testcases[selectedTestcase].output}
                stdout={testcases[selectedTestcase].stdout}
                result={testcases[selectedTestcase].result}
              />
            </TabPanel>
            <TabPanel value={selectedTab} selected="chat">
              <Chat isActive={selectedTab === "chat"} />
            </TabPanel>
          </Box>
        </Grid2>
      </Grid2>
    </AppMargin>
  );
};

export default CollabSandbox;
