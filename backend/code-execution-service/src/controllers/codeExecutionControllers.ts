import { Request, Response } from "express";
import { oneCompilerApi } from "../utils/oneCompilerApi";

interface CompilerResult {
  status: string;
  exception: string | null;
  stdout: string;
  stderr: string | null;
  executionTime: number;
  stdin: string;
}

export const executeCode = async (req: Request, res: Response) => {
  const {
    language,
    code,
    stdinList,
    stdoutList: expectedStdoutList,
  } = req.body;

  if (!language || !code || !stdinList || !expectedStdoutList) {
    res.status(400).json({
      error:
        "Missing required fields: language, code, stdinList, or stdoutList",
    });
  }

  if (stdinList.length !== expectedStdoutList.length) {
    res.status(400).json({
      error: "The length of stdinList and stdoutList must be the same.",
    });
  }

  try {
    const response = await oneCompilerApi(language, stdinList, code);

    const results = (response.data as CompilerResult[]).map((result, index) => {
      const {
        status,
        exception,
        stdout: actualStdout,
        stderr,
        stdin,
        executionTime,
      } = result;
      const expectedStdout = expectedStdoutList[index];

      return {
        status,
        exception,
        expectedStdout,
        actualStdout,
        stderr,
        stdin,
        executionTime,
        isMatch:
          stderr !== null
            ? false
            : actualStdout.trim() === expectedStdout.trim(),
      };
    });

    res.status(200).json({
      message: "Code executed successfully",
      results,
    });
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({ error: "Failed to execute code" });
  }
};
