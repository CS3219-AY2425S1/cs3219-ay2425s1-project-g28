import express from "express";
import {
  createQuestion,
  deleteQuestion,
  createImageLink,
  updateQuestion,
  readQuestionsList,
  readQuestionIndiv,
  readCategories,
} from "../controllers/questionController.ts";
import { verifyAdminToken } from "../middlewares/basicAccessControl.ts";

const router = express.Router();

router.post("/", verifyAdminToken, createQuestion);

router.post("/images", verifyAdminToken, createImageLink);

router.put("/:id", verifyAdminToken, updateQuestion);

router.get("/categories", readCategories);

router.get("/", readQuestionsList);

router.get("/:id", readQuestionIndiv);

router.delete("/:id", verifyAdminToken, deleteQuestion);

export default router;
