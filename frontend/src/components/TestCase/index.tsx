import { Box, styled, Typography } from "@mui/material";

type TestCaseProps = {
  input: string;
  output: string;
  stdout: string;
  result: string;
};

const StyledBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  background: theme.palette.divider,
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  whiteSpace: "pre-line",
}));

const TestCase: React.FC<TestCaseProps> = ({
  input,
  output,
  stdout,
  result,
}) => {
  return (
    <Box>
      <StyledBox sx={(theme) => ({ marginBottom: theme.spacing(2) })}>
        <Typography variant="overline">Input</Typography>
        <StyledTypography fontFamily={"monospace"}>{input}</StyledTypography>
      </StyledBox>
      <StyledBox>
        <Typography variant="overline">Output</Typography>
        <StyledTypography fontFamily={"monospace"}>{output}</StyledTypography>
      </StyledBox>
      <StyledBox>
        <Typography variant="overline">Standard output</Typography>
        <StyledTypography fontFamily={"monospace"}>{stdout}</StyledTypography>
      </StyledBox>
      <StyledBox>
        <Typography variant="overline">Result</Typography>
        <StyledTypography fontFamily={"monospace"}>{result}</StyledTypography>
      </StyledBox>
    </Box>
  );
};

export default TestCase;
