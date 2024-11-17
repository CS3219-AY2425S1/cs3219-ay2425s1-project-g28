import { NextFunction, Response, Request } from "express";
import { userClient } from "../utils/api";

export const verifyAdminToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  userClient
    .get("/auth/verify-admin-token", { headers: { Authorization: authHeader } })
    .then(() => next())
    .catch((err) => {
      console.log(err.response);
      return res.status(err.response?.status).json(err.response?.data);
    });
};
