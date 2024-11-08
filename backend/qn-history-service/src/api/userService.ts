import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://user-service:3001/api";

export const userClient = axios.create({
  baseURL: USER_SERVICE_URL,
  withCredentials: true,
});
