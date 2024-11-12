import axios from "axios";

const usersUrl =
  import.meta.env.VITE_USER_SERVICE_URL ?? "http://localhost:3001/api";
const questionsUrl =
  import.meta.env.VITE_QN_SERVICE_URL ?? "http://localhost:3000/api/questions";
const codeExecutionUrl =
  import.meta.env.VITE_CODE_EXEC_SERVICE_URL ?? "http://localhost:3004/api/run";
const qnHistoriesUrl =
  import.meta.env.VITE_QN_HIST_SERVICE_URL ??
  "http://localhost:3006/api/qnhistories";

export const questionClient = axios.create({
  baseURL: questionsUrl,
  withCredentials: true,
});

export const userClient = axios.create({
  baseURL: usersUrl,
  withCredentials: true,
});

export const codeExecutionClient = axios.create({
  baseURL: codeExecutionUrl,
  withCredentials: true,
});

export const qnHistoryClient = axios.create({
  baseURL: qnHistoriesUrl,
  withCredentials: true,
});
