import { HelpOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";
import { ADD_QUESTION_TEST_CASE_TOOLTIP_MESSAGE } from "../../utils/constants";

interface QuestionTestCasesProps {
  testCases: TestCase[];
  setTestCases: Dispatch<SetStateAction<TestCase[]>>;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

const QuestionTestCases: React.FC<QuestionTestCasesProps> = ({
  testCases,
  setTestCases,
}) => {
  const handleAddTestCase = () => {
    if (testCases.length < 3) {
      setTestCases((testCases) => [
        ...testCases,
        { id: uuidv4(), input: "", expectedOutput: "" },
      ]);
    }
  };

  const handleDeleteTestCase = (testCaseId: string) => {
    setTestCases((testCases) =>
      testCases.filter((testCase) => testCase.id !== testCaseId)
    );
  };

  const handleInputChange = (
    testCaseId: string,
    field: keyof TestCase,
    value: string
  ) => {
    setTestCases((testCases) =>
      testCases.map((testCase) =>
        testCase.id === testCaseId ? { ...testCase, [field]: value } : testCase
      )
    );
  };

  return (
    <Box marginTop={2}>
      {testCases.map((testCase, i) => (
        <Box
          key={testCase.id}
          display="flex"
          flexDirection="column"
          marginY={1}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center">
              <Typography variant="h6">Test Case {i + 1}</Typography>
              {i === 0 ? (
                <Tooltip
                  title={
                    <Typography variant="body2">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ADD_QUESTION_TEST_CASE_TOOLTIP_MESSAGE,
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
                </Tooltip>
              ) : (
                <></>
              )}
            </Stack>
            <Stack direction="row" alignItems="center">
              {i === testCases.length - 1 && testCases.length < 3 ? (
                <>
                  {i === 0 ? (
                    <></>
                  ) : (
                    <Button
                      sx={{ marginRight: 1 }}
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteTestCase(testCase.id)}
                    >
                      Delete
                    </Button>
                  )}
                  <Button variant="outlined" onClick={handleAddTestCase}>
                    Add test case
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteTestCase(testCase.id)}
                >
                  Delete
                </Button>
              )}
            </Stack>
          </Stack>
          <TextField
            label="Input"
            variant="outlined"
            value={testCase.input}
            onChange={(e) =>
              handleInputChange(testCase.id, "input", e.target.value)
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Expected Output"
            variant="outlined"
            value={testCase.expectedOutput}
            onChange={(e) =>
              handleInputChange(testCase.id, "expectedOutput", e.target.value)
            }
            fullWidth
            margin="normal"
          />
        </Box>
      ))}
    </Box>
  );
};

export default QuestionTestCases;
