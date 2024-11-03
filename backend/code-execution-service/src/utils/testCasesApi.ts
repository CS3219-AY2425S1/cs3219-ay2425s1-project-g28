import axios from "axios";

export const testCasesApi = async (
  inputFileUrl: string,
  outputFileUrl: string
) => {
  const inputFileUrlResponse = await axios.get(inputFileUrl);
  const outputFileUrlResponse = await axios.get(outputFileUrl);

  // Split the input and output files by double new line
  return {
    input: inputFileUrlResponse.data.split(/\r?\n\r?\n/),
    output: outputFileUrlResponse.data.split(/\r?\n\r?\n/),
  };
};
