import axios from "axios";

const getUserUrl = () => {
  return import.meta.env.SOME_ENV_VAR_HERE ?? "http://localhost:3001/api";
};

const getQuestionsUrl = () => {
  return (
    import.meta.env.SOME_ENV_VAR_HERE ?? "http://localhost:3000/api/questions"
  );
};

const getCodeExecutionUrl = () => {
  return import.meta.env.SOME_ENV_VAR_HERE ?? "http://localhost:3004/api/run";
};

const getQnHistoriesUrl = () => {
  return (
    import.meta.env.SOME_ENV_VAR_HERE ?? "http://localhost:3006/api/qnhistories"
  );
};

const usersUrl = getUserUrl();
const questionsUrl = getQuestionsUrl();
const codeExecutionUrl = getCodeExecutionUrl();
const qnHistoriesUrl = getQnHistoriesUrl();

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
