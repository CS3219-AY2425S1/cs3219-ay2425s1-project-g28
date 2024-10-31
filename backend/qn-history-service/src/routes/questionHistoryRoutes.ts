import express from "express";
import {
  createQnHistory,
  deleteQnHistory,
  readQnHistIndiv,
  readQnHistoryList,
  updateQnHistory,
} from "../controllers/questionHistoryController";

const router = express.Router();

router.post("/", createQnHistory);

router.put("/:id", updateQnHistory);

router.get("/", readQnHistoryList);

router.get("/:id", readQnHistIndiv);

router.delete("/:id", deleteQnHistory);

export default router;
