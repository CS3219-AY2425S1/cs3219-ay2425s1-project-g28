import { Box, IconButton, Stack, Typography } from "@mui/material";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { HelpOutlined } from "@mui/icons-material";
import QuestionFileContainer from "../QuestionFileContainer";
import { ADD_TEST_CASE_FILES_TOOLTIP_MESSAGE } from "../../utils/constants";
import { styled } from "@mui/material/styles";

interface QuestionTestCasesFileUploadProps {
  testcaseInputFile: File | null;
  setTestcaseInputFile: React.Dispatch<React.SetStateAction<File | null>>;
  testcaseOutputFile: File | null;
  setTestcaseOutputFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 400,
  },
});

const QuestionTestCasesFileUpload: React.FC<
  QuestionTestCasesFileUploadProps
> = ({
  testcaseInputFile,
  setTestcaseInputFile,
  testcaseOutputFile,
  setTestcaseOutputFile,
}) => {
  return (
    <Box>
      <Stack direction="row" alignItems="center" marginY={2}>
        <Typography variant="h6">Test Cases File Upload</Typography>
        <CustomWidthTooltip
          title={
            <Typography variant="body2">
              <span
                dangerouslySetInnerHTML={{
                  __html: ADD_TEST_CASE_FILES_TOOLTIP_MESSAGE,
                }}
              />
            </Typography>
          }
          placement="right"
          arrow
        >
          <IconButton>
            <HelpOutlined fontSize="small" />
          </IconButton>
        </CustomWidthTooltip>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <QuestionFileContainer
          fileUploadMessage={`Upload test case inputs (.txt or .text)`}
          marginRight={5}
          file={testcaseInputFile}
          setFile={setTestcaseInputFile}
        />
        <QuestionFileContainer
          fileUploadMessage={`Upload test case expected outputs (.txt or .text)`}
          marginLeft={5}
          file={testcaseOutputFile}
          setFile={setTestcaseOutputFile}
        />
      </Stack>
    </Box>
  );
};

export default QuestionTestCasesFileUpload;
