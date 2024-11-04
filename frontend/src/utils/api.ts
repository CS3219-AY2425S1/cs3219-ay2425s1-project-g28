import axios from "axios";

const usersUrl = "http://localhost:3001/api";
const questionsUrl = "http://localhost:3000/api/questions";
const qnHistoriesUrl = "http://localhost:3006/api/qnhistories";

export const questionClient = axios.create({
  baseURL: questionsUrl,
  withCredentials: true,
});

export const userClient = axios.create({
  baseURL: usersUrl,
  withCredentials: true,
});

export const qnHistoryClient = axios.create({
  baseURL: qnHistoriesUrl,
  withCredentials: true,
});
