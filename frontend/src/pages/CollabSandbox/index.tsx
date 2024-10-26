import AppMargin from "../../components/AppMargin";
import { Box } from "@mui/material";
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
  const { verifyMatchStatus, partner, loading, questionId } = match;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { selectedQuestion } = state;

  useEffect(() => {
    verifyMatchStatus();

    if (!questionId) {
      return;
    }
    getQuestionById(questionId, dispatch);
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
        <Button variant="outlined" color="error" onClick={() => stopMatch()}>
          End Session
        </Button>
      </Stack> */}
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
