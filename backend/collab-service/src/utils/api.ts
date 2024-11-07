import axios from "axios";

const QN_HISTORY_SERVICE_URL =
  process.env.QN_HISTORY_SERVICE_URL ||
  "http://qn-history-service:3006/api/qnhistories";

export const qnHistoryService = axios.create({
  baseURL: QN_HISTORY_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
