import axios from "axios";

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:3001/api";

const userClient = axios.create({
  baseURL: USER_SERVICE_URL,
  withCredentials: true,
});

export const verifyToken = (token: string | undefined) => {
  return userClient.get("/auth/verify-token", {
    headers: { authorization: token },
  });
};
