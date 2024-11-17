import express from "express";
import { executeCode } from "../controllers/codeExecutionControllers";

const router = express.Router();

router.post("/", executeCode);

export default router;
