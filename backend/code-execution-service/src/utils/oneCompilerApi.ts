import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const oneCompilerApi = async (
  language: String,
  stdin: String,
  files: String
) => {
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
