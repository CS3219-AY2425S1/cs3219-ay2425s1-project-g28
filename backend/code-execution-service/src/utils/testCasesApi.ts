import axios from "axios";

export const testCasesApi = async (
  inputFileUrl: string,
  outputFileUrl: string
) => {
  const inputFileUrlResponse = await axios.get(inputFileUrl);
  const outputFileUrlResponse = await axios.get(outputFileUrl);

  // Split the input and output files by triple new line
  return {
    input: inputFileUrlResponse.data.replace(/\r\n/g, "\n").split("\n\n\n"),
    output: outputFileUrlResponse.data.replace(/\r\n/g, "\n").split("\n\n\n"),
  };
};
