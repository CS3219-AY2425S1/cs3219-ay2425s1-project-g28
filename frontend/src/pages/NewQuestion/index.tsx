import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  Button,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import reducer, {
  createQuestion,
  initialState,
} from "../../reducers/questionReducer";
import { toast } from "react-toastify";

import {
  ABORT_CREATE_OR_EDIT_QUESTION_CONFIRMATION_MESSAGE,
  complexityList,
  FAILED_QUESTION_CREATE,
  FILL_ALL_FIELDS,
  SUCCESS_QUESTION_CREATE,
} from "../../utils/constants";
import AppMargin from "../../components/AppMargin";
import QuestionMarkdown from "../../components/QuestionMarkdown";
import QuestionImageContainer from "../../components/QuestionImageContainer";
import QuestionCategoryAutoComplete from "../../components/QuestionCategoryAutoComplete";
import QuestionDetail from "../../components/QuestionDetail";
import QuestionTestCases, {
  TestCase,
} from "../../components/QuestionTestCases";
import { v4 as uuidv4 } from "uuid";
import QuestionTestCasesFileUpload from "../../components/QuestionTestCasesFileUpload";
import QuestionCodeTemplates from "../../components/QuestionCodeTemplates";

const NewQuestion = () => {
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, initialState);

  const [title, setTitle] = useState<string>("");
  const [markdownText, setMarkdownText] = useState<string>("");
  const [selectedComplexity, setselectedComplexity] = useState<string | null>(
    null
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [uploadedImagesUrl, setUploadedImagesUrl] = useState<string[]>([]);
  const [isPreviewQuestion, setIsPreviewQuestion] = useState<boolean>(false);

  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: uuidv4(), input: "", expectedOutput: "" },
  ]);
  const [testcaseInputFile, setTestcaseInputFile] = useState<File | null>(null);
  const [testcaseOutputFile, setTestcaseOutputFile] = useState<File | null>(
    null
  );

  const [codeTemplates, setCodeTemplates] = useState<{ [key: string]: string }>(
    {
      python: "",
      java: "",
      c: "",
    }
  );

  const handleBack = () => {
    if (
      title ||
      markdownText ||
      selectedComplexity ||
      selectedCategories.length > 0
    ) {
      if (!confirm(ABORT_CREATE_OR_EDIT_QUESTION_CONFIRMATION_MESSAGE)) {
        return;
      }
    }
    navigate("/questions");
  };

  const handleSubmit = async () => {
    if (
      !title ||
      !markdownText ||
      !selectedComplexity ||
      selectedCategories.length === 0 ||
      testCases.some(
        (testCase) =>
          testCase.input.trim() === "" || testCase.expectedOutput.trim() === ""
      ) ||
      testcaseInputFile === null ||
      testcaseOutputFile === null ||
      Object.values(codeTemplates).some((value) => value === "")
    ) {
      toast.error(FILL_ALL_FIELDS);
      return;
    }

    const result = await createQuestion(
      {
        title,
        description: markdownText,
        complexity: selectedComplexity,
        categories: selectedCategories,
        testcases: testCases,
        pythonTemplate: codeTemplates.python,
        javaTemplate: codeTemplates.java,
        cTemplate: codeTemplates.c,
      },
      {
        testcaseInputFile: testcaseInputFile,
        testcaseOutputFile: testcaseOutputFile,
      },
      dispatch
    );

    if (result) {
      navigate("/questions");
      toast.success(SUCCESS_QUESTION_CREATE);
    } else {
      toast.error(state.selectedQuestionError || FAILED_QUESTION_CREATE);
    }
  };

  return (
    <AppMargin>
      <IconButton onClick={handleBack} sx={{ marginTop: 2 }}>
        <ArrowBackIcon />
      </IconButton>

      {isPreviewQuestion ? (
        <QuestionDetail
          title={title}
          complexity={selectedComplexity}
          categories={selectedCategories}
          description={markdownText}
        />
      ) : (
        <>
          <TextField
            label="Title"
            variant="outlined"
            fullWidth
            autoComplete="off"
            value={title}
            sx={{ marginTop: 2 }}
            onChange={(value) => setTitle(value.target.value)}
          />

          <Autocomplete
            options={complexityList}
            sx={{ marginTop: 2 }}
            onChange={(_e, newcomplexitySelected) => {
              setselectedComplexity(newcomplexitySelected);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Complexity" />
            )}
          />

          <QuestionCategoryAutoComplete
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />

          <QuestionImageContainer
            uploadedImagesUrl={uploadedImagesUrl}
            setUploadedImagesUrl={setUploadedImagesUrl}
          />

          <QuestionMarkdown
            markdownText={markdownText}
            setMarkdownText={setMarkdownText}
          />

          <QuestionTestCases
            testCases={testCases}
            setTestCases={setTestCases}
          />

          <QuestionTestCasesFileUpload
            testcaseInputFile={testcaseInputFile}
            setTestcaseInputFile={setTestcaseInputFile}
            testcaseOutputFile={testcaseOutputFile}
            setTestcaseOutputFile={setTestcaseOutputFile}
          />

          <QuestionCodeTemplates
            codeTemplates={codeTemplates}
            setCodeTemplates={setCodeTemplates}
          />
        </>
      )}

      <Stack spacing={2} direction="row" paddingTop={2} paddingBottom={8}>
        <Button variant="contained" fullWidth onClick={handleSubmit}>
          Submit Question
        </Button>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          disabled={
            !title &&
            !markdownText &&
            !selectedComplexity &&
            selectedCategories.length === 0
          }
          onClick={() => setIsPreviewQuestion((prev) => !prev)}
        >
          {isPreviewQuestion ? "Edit Question" : "Preview Question"}
        </Button>
      </Stack>
    </AppMargin>
  );
};

export default NewQuestion;
