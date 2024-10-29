import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

interface FileType {
  name: string;
  content: string;
}

export const oneCompilerApi = async (
  language: string,
  stdin: string,
  userCode: string
) => {
  let files: FileType[] = [];
  if (language === "python") {
    files = [{ name: "main.py", content: userCode }];
  } else if (language === "java") {
    files = [{ name: "Main.java", content: userCode }];
  } else if (language === "c") {
    files = [{ name: "main.c", content: userCode }];
  }

  const response = await axios.post(
    process.env.ONE_COMPILER_URL ||
      "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
    {
      language,
      stdin,
      files,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
        "x-rapidapi-key": process.env.ONE_COMPILER_KEY,
      },
    }
  );

  return response;
};
