import express from "express";
import {
  createQnHistory,
  readQnHistIndiv,
  readQnHistoryList,
  updateQnHistory,
} from "../controllers/questionHistoryController";
import { verifyToken } from "../middlewares/basicAccessControl";

const router = express.Router();

router.post("/", verifyToken, createQnHistory);

router.put("/:id", verifyToken, updateQnHistory);

router.get("/", readQnHistoryList);

router.get("/:id", readQnHistIndiv);

export default router;
