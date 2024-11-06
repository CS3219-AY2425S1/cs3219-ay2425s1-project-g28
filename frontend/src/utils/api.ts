import axios from "axios";

const usersUrl = "http://localhost:3001/api";
const questionsUrl = "http://localhost:3000/api/questions";
const codeExecutionUrl = "http://localhost:3004/api/run";
const qnHistoriesUrl = "http://localhost:3006/api/qnhistories";

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
