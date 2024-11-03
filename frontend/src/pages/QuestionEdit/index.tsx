import { useEffect, useState, useReducer } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Autocomplete,
  Button,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";

import {
  ABORT_CREATE_OR_EDIT_QUESTION_CONFIRMATION_MESSAGE,
  complexityList,
  FAILED_QUESTION_UPDATE,
  FILL_ALL_FIELDS,
  NO_QUESTION_CHANGES,
  SUCCESS_QUESTION_UPDATE,
} from "../../utils/constants";
import reducer, {
  getQuestionById,
  updateQuestionById,
  initialState,
} from "../../reducers/questionReducer";
import AppMargin from "../../components/AppMargin";
import QuestionMarkdown from "../../components/QuestionMarkdown";
import QuestionImageContainer from "../../components/QuestionImageContainer";
import QuestionCategoryAutoComplete from "../../components/QuestionCategoryAutoComplete";
import QuestionDetail from "../../components/QuestionDetail";
import QuestionTestCases, {
  TestCase,
} from "../../components/QuestionTestCases";
import QuestionTestCasesFileUpload from "../../components/QuestionTestCasesFileUpload";
import QuestionCodeTemplates from "../../components/QuestionCodeTemplates";
import { isTestcaseUnchanged } from "../../utils/validators";

const QuestionEdit = () => {
  const navigate = useNavigate();

  const { questionId } = useParams<{ questionId: string }>();
  const [state, dispatch] = useReducer(reducer, initialState);

  const [title, setTitle] = useState<string>("");
  const [markdownText, setMarkdownText] = useState<string>("");
  const [selectedComplexity, setSelectedComplexity] = useState<string | null>(
    null
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
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
  const [uploadedImagesUrl, setUploadedImagesUrl] = useState<string[]>([]);
  const [isPreviewQuestion, setIsPreviewQuestion] = useState<boolean>(false);

  useEffect(() => {
    if (!questionId) {
      return;
    }
    getQuestionById(questionId, dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.selectedQuestion) {
      setTitle(state.selectedQuestion.title);
      setMarkdownText(state.selectedQuestion.description);
      setSelectedComplexity(state.selectedQuestion.complexity);
      setSelectedCategories(state.selectedQuestion.categories);
      setTestCases(state.selectedQuestion.testcases);
      setCodeTemplates({
        python: state.selectedQuestion.pythonTemplate,
        java: state.selectedQuestion.javaTemplate,
        c: state.selectedQuestion.cTemplate,
      });
    }
  }, [state.selectedQuestion]);

  const handleBack = () => {
    if (!confirm(ABORT_CREATE_OR_EDIT_QUESTION_CONFIRMATION_MESSAGE)) {
      return;
    }
    navigate("/questions");
  };

  const handleUpdate = async () => {
    if (!state.selectedQuestion) {
      return;
    }

    if (
      title === state.selectedQuestion.title &&
      markdownText === state.selectedQuestion.description &&
      selectedComplexity === state.selectedQuestion.complexity &&
      selectedCategories === state.selectedQuestion.categories &&
      isTestcaseUnchanged(testCases, state.selectedQuestion.testcases) &&
      codeTemplates.python === state.selectedQuestion.pythonTemplate &&
      codeTemplates.java === state.selectedQuestion.javaTemplate &&
      codeTemplates.c === state.selectedQuestion.cTemplate &&
      testcaseInputFile === null &&
      testcaseOutputFile === null
    ) {
      toast.error(NO_QUESTION_CHANGES);
      return;
    }

    if (
      !title ||
      !markdownText ||
      !selectedComplexity ||
      selectedCategories.length === 0 ||
      testCases.some(
        (testCase) =>
          testCase.input.trim() === "" || testCase.expectedOutput.trim() === ""
      ) ||
      Object.values(codeTemplates).some((value) => value === "")
    ) {
      toast.error(FILL_ALL_FIELDS);
      return;
    }

    const result = await updateQuestionById(
      state.selectedQuestion.id,
      {
        title,
        description: markdownText,
        complexity: selectedComplexity,
        categories: selectedCategories,
        testcases: testCases,
        testcaseInputFileUrl: state.selectedQuestion.testcaseInputFileUrl,
        testcaseOutputFileUrl: state.selectedQuestion.testcaseOutputFileUrl,
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
      toast.success(SUCCESS_QUESTION_UPDATE);
    } else {
      toast.error(state.selectedQuestionError || FAILED_QUESTION_UPDATE);
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
            value={selectedComplexity}
            onChange={(_e, newcomplexitySelected) => {
              setSelectedComplexity(newcomplexitySelected);
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
        <Button variant="contained" fullWidth onClick={handleUpdate}>
          Update Question
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

export default QuestionEdit;
