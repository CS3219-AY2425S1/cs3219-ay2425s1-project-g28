import axios from "axios";

const QUESTION_SERVICE_URL =
  process.env.QUESTION_SERVICE_URL ||
  "http://question-service:3000/api/questions";

export const questionService = axios.create({
  baseURL: QUESTION_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
