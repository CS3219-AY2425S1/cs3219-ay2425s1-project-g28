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

const QuestionEdit = () => {
  const navigate = useNavigate();

  const { questionId } = useParams<{ questionId: string }>();
  const [state, dispatch] = useReducer(reducer, initialState);

  const [title, setTitle] = useState<string>("");
  const [markdownText, setMarkdownText] = useState<string>("");
  const [selectedComplexity, setselectedComplexity] = useState<string | null>(
    null
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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
      setselectedComplexity(state.selectedQuestion.complexity);
      setSelectedCategories(state.selectedQuestion.categories);
    }
  }, [state.selectedQuestion]);

  const handleBack = () => {
    if (
      !confirm(
        "Are you sure you want to leave this page? All process will be lost."
      )
    ) {
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
      selectedCategories === state.selectedQuestion.categories
    ) {
      toast.error(NO_QUESTION_CHANGES);
      return;
    }

    if (
      !title ||
      !markdownText ||
      !selectedComplexity ||
      selectedCategories.length === 0
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
