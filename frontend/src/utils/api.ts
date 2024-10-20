import axios from "axios";

const usersUrl = "http://localhost:3001/api";
const questionsUrl = "http://localhost:3000/api/questions";

export const questionClient = axios.create({
  baseURL: questionsUrl,
  withCredentials: true,
});

export const userClient = axios.create({
  baseURL: usersUrl,
  withCredentials: true,
});
