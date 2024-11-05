import axios from "axios";

export const testCasesApi = async (
  inputFileUrl: string,
  outputFileUrl: string
) => {
  try {
    const inputFileUrlResponse = await axios.get(inputFileUrl);
    const outputFileUrlResponse = await axios.get(outputFileUrl);

    // Split the input and output files by double new line
    return {
      input: inputFileUrlResponse.data.replace(/\r\n/g, "\n").split("\n\n"),
      output: outputFileUrlResponse.data.replace(/\r\n/g, "\n").split("\n\n"),
    };
  } catch {
    console.log("Failed to fetch test cases");
    return { input: [], output: [] };
  }
};
