import axios from "axios";

const QUESTION_SERVICE_URL =
  process.env.QUESTION_SERVICE_URL ||
  "http://question-service:3000/api/questions";

const QN_HISTORY_SERVICE_URL =
  process.env.QN_HISTORY_SERVICE_URL ||
  "http://qn-history-service:3005/api/qnhistories";

export const questionService = axios.create({
  baseURL: QUESTION_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const qnHistoryService = axios.create({
  baseURL: QN_HISTORY_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
