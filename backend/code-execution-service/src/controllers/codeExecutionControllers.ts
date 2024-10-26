import { Request, Response } from "express";
import { oneCompilerApi } from "../utils/oneCompilerApi";

export const executeCode = async (req: Request, res: Response) => {
  const { language, stdin, files } = req.body;

  if (!language || !stdin || !files) {
    res
      .status(400)
      .json({ error: "Missing required fields: language, stdin, or files" });
  }

  try {
    const response = await oneCompilerApi(language, stdin, files);
    res.json(response.data);
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({ error: "Failed to execute code" });
  }
};
