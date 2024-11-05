import { Request, Response } from "express";
import { oneCompilerApi } from "../utils/oneCompilerApi";
import {
  SUPPORTED_LANGUAGES,
  ERROR_MISSING_REQUIRED_FIELDS_MESSAGE,
  ERROR_UNSUPPORTED_LANGUAGE_MESSAGE,
  ERROR_FAILED_TO_EXECUTE_MESSAGE,
  ERROR_NOT_SAME_LENGTH_MESSAGE,
  SUCCESS_MESSAGE,
} from "../utils/constants";
import { questionService } from "../utils/questionApi";
import { testCasesApi } from "../utils/testCasesApi";

interface CompilerResult {
  status: string;
  exception: string | null;
  stdout: string;
  stderr: string | null;
  executionTime: number;
  stdin: string;
}

export const executeCode = async (req: Request, res: Response) => {
  const { questionId, language, code } = req.body;

  if (!language || !code || !questionId) {
    res.status(400).json({
      message: ERROR_MISSING_REQUIRED_FIELDS_MESSAGE,
    });
    return;
  }

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    res.status(400).json({
      message: ERROR_UNSUPPORTED_LANGUAGE_MESSAGE,
    });
    return;
  }

  try {
    // Get question test case files
    const qnsResponse = await questionService.get(`/${questionId}`);
    const { testcaseInputFileUrl, testcaseOutputFileUrl } =
      qnsResponse.data.question;

    // Extract test cases from input and output files
    const testCases = await testCasesApi(
      testcaseInputFileUrl,
      testcaseOutputFileUrl
    );

    const stdinList: string[] = testCases.input;
    const expectedResultList: string[] = testCases.output;

    if (stdinList.length !== expectedResultList.length) {
      res.status(400).json({
        message: ERROR_NOT_SAME_LENGTH_MESSAGE,
      });
      return;
    }

    // Execute code for each test case
    const compilerResponse = await oneCompilerApi(language, stdinList, code);

    const compilerData = (compilerResponse.data as CompilerResult[]).map(
      (result, index) => {
        let { stdout, ...restofResult } = result; // eslint-disable-line
        const expectedResultValue = expectedResultList[index].trim();

        if (!stdout) {
          stdout = "";
        }

        // Extract the last line as the result value
        // and the rest as stdout
        const lines = stdout.trim().split("\n");
        const resultValue = lines.pop() || "";
        stdout = lines.join("\n");

        return {
          ...restofResult,
          stdout,
          actualResult: resultValue,
          expectedResult: expectedResultValue,
          isMatch:
            result.stderr !== null
              ? false
              : resultValue === expectedResultValue,
        };
      }
    );

    res.status(200).json({
      message: SUCCESS_MESSAGE,
      data: compilerData,
    });
  } catch {
    res.status(500).json({ message: ERROR_FAILED_TO_EXECUTE_MESSAGE });
  }
};
