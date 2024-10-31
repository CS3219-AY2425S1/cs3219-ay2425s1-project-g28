import { useEffect, useReducer } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppMargin from "../../components/AppMargin";
import ServerError from "../../components/ServerError";
import QuestionDetailComponent from "../../components/QuestionDetail";
import reducer, {
  getQuestionById,
  initialState,
} from "../../reducers/questionReducer";
import qnHistoryReducer, { getQnHistoryById, initialQHState, setSelectedQnHistoryError } from "../../reducers/qnHistoryReducer";
import { Box, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { grey } from "@mui/material/colors";
import { convertDateString } from "../../utils/sessionTime";
import { useAuth } from "../../contexts/AuthContext";
import { USE_AUTH_ERROR_MESSAGE } from "../../utils/constants";

const QuestionHistoryDetail: React.FC = () => {
  const { qnHistoryId } = useParams<{ qnHistoryId: string }>();
  const [qnhistState, qnhistDispatch] = useReducer(qnHistoryReducer, initialQHState);
  const [qnState, qnDispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const auth = useAuth();

  if (!auth) {
    throw new Error(USE_AUTH_ERROR_MESSAGE);
  }

  const { user } = auth;

  const tableHeaders = ["Status", "Date submitted", "Time taken", "Partner"]

  useEffect(() => {
    if (!qnHistoryId) {
      setSelectedQnHistoryError("Unable to fetch question history.", qnhistDispatch);
      return;
    }

    getQnHistoryById(qnHistoryId, qnhistDispatch);
    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (qnhistState.selectedQnHistory) {
      getQuestionById(qnhistState.selectedQnHistory.questionId, qnDispatch);
    }
  }, [qnhistState])


  const getPartnerId = (userIds: string[], currUserId: string): string => {
    if (currUserId == userIds[0]) {
      return userIds[1];
    } else {
      return userIds[0];
    }
  } 

  if (!qnhistState.selectedQnHistory) {
    if (qnhistState.selectedQnHistoryError) {
      return (
        <ServerError
          title="Question history not found..."
          subtitle="Unfortunately, we can't find what you're looking for 😥"
        />
      );
    } else {
      return;
    }
  }

  const partnerId = user && qnhistState.selectedQnHistory && getPartnerId(qnhistState.selectedQnHistory.userIds, user.id);

  return (
    <AppMargin>
      <IconButton  sx={{marginTop: 2}} onClick={() => navigate(-1)}>
        <ArrowBack />
      </IconButton>
      { user && qnhistState.selectedQnHistory &&
      <TableContainer>
        <Table
          sx={(theme) => ({
            "& .MuiTableCell-root": { padding: theme.spacing(1.2) },
            whiteSpace: "nowrap",
          })}
        >
          <TableHead>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableCell key={header}>
                  <Typography component="span" variant="h6">
                    {header}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Typography
                  component="span"
                  sx={{
                    color:
                      qnhistState.selectedQnHistory.submissionStatus === "Accepted"
                        ? "success.main"
                        : qnhistState.selectedQnHistory.submissionStatus === "Attempted"
                        ? "#D2C350"
                        : qnhistState.selectedQnHistory.submissionStatus === "Rejected"
                        ? "error.main"
                        : grey[500],
                  }}
                >
                  {qnhistState.selectedQnHistory.submissionStatus}
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  borderLeft: "1px solid #E0E0E0",
                  borderRight: "1px solid #E0E0E0",
                }}
              >
                <Typography
                  component="span"
                >
                  {convertDateString(qnhistState.selectedQnHistory.dateAttempted)}
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  borderLeft: "1px solid #E0E0E0",
                  borderRight: "1px solid #E0E0E0",
                }}
              >
                <Typography
                  component="span"
                >
                  {`${qnhistState.selectedQnHistory.timeTaken} mins`}
                </Typography>
              </TableCell>
              <TableCell
                sx={{
                  borderLeft: "1px solid #E0E0E0",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    "&:hover": { cursor: "pointer", color: "primary.main" },
                  }}
                  onClick={() => navigate(`/profile/${partnerId}`)}
                >
                  {"Go to partner profile"}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      }
      <Box sx={{ display: "flex", flex: 1 }}>
        <Box sx={(theme) => ({ flex: 1, marginRight: theme.spacing(2) })}>
          {qnState.selectedQuestion
            ? <QuestionDetailComponent
                title={qnState.selectedQuestion.title}
                complexity={qnState.selectedQuestion.complexity}
                categories={qnState.selectedQuestion.categories}
                description={qnState.selectedQuestion.description}
              />
            : <ServerError
                title="Question not found..."
                subtitle="Unfortunately, we can't find what you're looking for 😥"
              />
          }
        </Box>
        <Box sx={(theme) => ({ flex: 1, marginLeft: theme.spacing(2) })}>
          <Box
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Box sx={{ flex: 1 }}>Code editor</Box>
          </Box>
        </Box>
      </Box>
    </AppMargin>
  );
};

export default QuestionHistoryDetail;
