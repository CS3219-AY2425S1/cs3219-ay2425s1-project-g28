import axios from "axios";

const QUESTION_SERVICE_URL =
  process.env.QUESTION_SERVICE_URL ||
  "http://question-service:3000/api/questions";

const questionClient = axios.create({
  baseURL: QUESTION_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getRandomQuestion = (complexity: string, category: string) => {
  return questionClient.get("/random", { params: { complexity, category } });
};
