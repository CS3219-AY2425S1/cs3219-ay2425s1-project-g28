import express from "express";

import { handleLogin, handleVerifyToken } from "../controller/auth-controller";
import {
  verifyAccessToken,
  verifyIsAdmin,
} from "../middleware/basic-access-control";

const router = express.Router();

router.post("/login", handleLogin);

router.get("/verify-token", verifyAccessToken, handleVerifyToken);

router.get(
  "/verify-admin-token",
  verifyAccessToken,
  verifyIsAdmin,
  handleVerifyToken
);

export default router;
