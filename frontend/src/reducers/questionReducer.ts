import { Dispatch } from "react";
import { questionClient } from "../utils/api";
import { isString, isStringArray } from "../utils/typeChecker";

type TestcaseFiles = {
  testcaseInputFile: File | null;
  testcaseOutputFile: File | null;
};

export const enum TestcaseFilesUploadRequestTypes {
  CREATE = "create",
  UPDATE = "update",
}

type QuestionDetail = {
  id: string;
  title: string;
  description: string;
  complexity: string;
  categories: Array<string>;
  inputs: Array<string>;
  outputs: Array<string>;
  pythonTemplate: string;
  javaTemplate: string;
  cTemplate: string;
};

// type QuestionDetailWithUrl = QuestionDetail & {
//   testcaseInputFileUrl: string;
//   testcaseOutputFileUrl: string;
// };

type QuestionListDetail = {
  id: string;
  title: string;
  description: string;
  complexity: string;
  categories: Array<string>;
};

type QuestionList = {
  questions: Array<QuestionListDetail>;
  questionCount: number;
};

enum QuestionActionTypes {
  CREATE_QUESTION = "create_question",
  VIEW_QUESTION_CATEGORIES = "view_question_categories",
  VIEW_QUESTION_LIST = "view_question_list",
  VIEW_QUESTION = "view_question",
  UPDATE_QUESTION = "update_question",
  ERROR_CREATING_QUESTION = "error_creating_question",
  ERROR_FETCHING_QUESTION_CATEGORIES = "error_fetching_question_categories",
  ERROR_FETCHING_QUESTION_LIST = "error_fetching_question_list",
  ERROR_FETCHING_SELECTED_QN = "error_fetching_selected_qn",
  ERROR_UPDATING_QUESTION = "error_updating_question",
}

type QuestionActions = {
  type: QuestionActionTypes;
  payload: QuestionList | QuestionDetail | string[] | string;
};

type QuestionsState = {
  questionCategories: Array<string>;
  questions: Array<QuestionListDetail>;
  questionCount: number;
  selectedQuestion: QuestionDetail | null;
  questionCategoriesError: string | null;
  questionListError: string | null;
  selectedQuestionError: string | null;
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const isQuestion = (question: any): question is QuestionDetail => {
  if (!question || typeof question !== "object") {
    return false;
  }

  return (
    isString(question.id) &&
    isString(question.title) &&
    isString(question.description) &&
    isString(question.complexity) &&
    isStringArray(question.categories)
  );
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const isQuestionList = (questionList: any): questionList is QuestionList => {
  if (!questionList || typeof questionList !== "object") {
    return false;
  }

  return (
    Array.isArray(questionList.questions) &&
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    questionList.questions.every((question: any) => isQuestion(question)) &&
    typeof questionList.questionCount === "number"
  );
};

export const initialState: QuestionsState = {
  questionCategories: [],
  questions: [],
  questionCount: 0,
  selectedQuestion: null,
  questionCategoriesError: null,
  questionListError: null,
  selectedQuestionError: null,
};

export const uploadTestcaseFiles = async (
  data: TestcaseFiles,
  requestType: TestcaseFilesUploadRequestTypes
): Promise<{
  message: string;
  urls: {
    testcaseInputFileUrl: string;
    testcaseOutputFileUrl: string;
  };
} | null> => {
  const formData = new FormData();
  formData.append("testcaseInputFile", data.testcaseInputFile ?? "");
  formData.append("testcaseOutputFile", data.testcaseOutputFile ?? "");
  formData.append("requestType", requestType);

  try {
    const accessToken = localStorage.getItem("token");
    const res = await questionClient.post("/tcfiles", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return res.data;
  } catch {
    return null;
  }
};

export const createQuestion = async (
  question: Omit<QuestionDetail, "id">,
  testcaseFiles: TestcaseFiles,
  dispatch: Dispatch<QuestionActions>
): Promise<boolean> => {
  const uploadResult = await uploadTestcaseFiles(
    testcaseFiles,
    TestcaseFilesUploadRequestTypes.CREATE
  );

  if (!uploadResult) {
    dispatch({
      type: QuestionActionTypes.ERROR_CREATING_QUESTION,
      payload: "Failed to upload test case files.",
    });
    return false;
  }

  const { testcaseInputFileUrl, testcaseOutputFileUrl } = uploadResult.urls;

  const accessToken = localStorage.getItem("token");
  return questionClient
    .post(
      "/",
      {
        title: question.title,
        description: question.description,
        complexity: question.complexity,
        category: question.categories,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate: question.pythonTemplate,
        cTemplate: question.cTemplate,
        javaTemplate: question.javaTemplate,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((res) => {
      dispatch({
        type: QuestionActionTypes.CREATE_QUESTION,
        payload: res.data,
      });
      return true;
    })
    .catch((err) => {
      console.log(err.response?.data.message || err.message);

      dispatch({
        type: QuestionActionTypes.ERROR_CREATING_QUESTION,
        payload: err.response?.data.message || err.message,
      });
      return false;
    });
};

export const getQuestionCategories = (dispatch: Dispatch<QuestionActions>) => {
  questionClient
    .get("/categories")
    .then((res) =>
      dispatch({
        type: QuestionActionTypes.VIEW_QUESTION_CATEGORIES,
        payload: res.data.categories,
      })
    )
    .catch((err) =>
      dispatch({
        type: QuestionActionTypes.ERROR_FETCHING_QUESTION_CATEGORIES,
        payload: err.response?.data.message || err.message,
      })
    );
};

export const getQuestionList = (
  page: number,
  qnLimit: number,
  title: string,
  complexities: string[],
  categories: string[],
  dispatch: Dispatch<QuestionActions>
) => {
  questionClient
    .get("", {
      params: {
        page: page,
        qnLimit: qnLimit,
        title: title,
        complexities: complexities,
        categories: categories,
      },
    })
    .then((res) =>
      dispatch({
        type: QuestionActionTypes.VIEW_QUESTION_LIST,
        payload: res.data,
      })
    )
    .catch((err) =>
      dispatch({
        type: QuestionActionTypes.ERROR_FETCHING_QUESTION_LIST,
        payload: err.response?.data.message || err.message,
      })
    );
};

export const getQuestionById = (
  questionId: string,
  dispatch: Dispatch<QuestionActions>
) => {
  questionClient
    .get(`/${questionId}`)
    .then((res) => {
      dispatch({
        type: QuestionActionTypes.VIEW_QUESTION,
        payload: res.data.question,
      });
    })
    .catch((err) =>
      dispatch({
        type: QuestionActionTypes.ERROR_FETCHING_SELECTED_QN,
        payload: err.response?.data.message || err.message,
      })
    );
};

export const updateQuestionById = async (
  questionId: string,
  question: Omit<QuestionDetail, "id">,
  testcaseFiles: TestcaseFiles,
  dispatch: Dispatch<QuestionActions>
): Promise<boolean> => {
  let urls = {};

  if (Object.values(testcaseFiles).some((file) => file !== null)) {
    const uploadResult = await uploadTestcaseFiles(
      testcaseFiles,
      TestcaseFilesUploadRequestTypes.UPDATE
    );

    if (!uploadResult) {
      dispatch({
        type: QuestionActionTypes.ERROR_CREATING_QUESTION,
        payload: "Failed to upload test case file(s).",
      });
      return false;
    }

    const { testcaseInputFileUrl, testcaseOutputFileUrl } = uploadResult.urls;

    urls = {
      ...(testcaseInputFileUrl ? { testcaseInputFileUrl } : {}),
      ...(testcaseOutputFileUrl ? { testcaseOutputFileUrl } : {}),
    };
  }

  const accessToken = localStorage.getItem("token");
  return questionClient
    .put(
      `/${questionId}`,
      {
        title: question.title,
        description: question.description,
        complexity: question.complexity,
        category: question.categories,
        // testcaseInputFileUrl: question.testcaseInputFileUrl,
        // testcaseOutputFileUrl: question.testcaseOutputFileUrl,
        ...urls,
        pythonTemplate: question.pythonTemplate,
        javaTemplate: question.javaTemplate,
        cTemplate: question.cTemplate,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((res) => {
      dispatch({
        type: QuestionActionTypes.UPDATE_QUESTION,
        payload: res.data,
      });
      return true;
    })
    .catch((err) => {
      dispatch({
        type: QuestionActionTypes.ERROR_UPDATING_QUESTION,
        payload: err.response?.data.message || err.message,
      });
      return false;
    });
};

export const deleteQuestionById = async (questionId: string) => {
  try {
    const accessToken = localStorage.getItem("token");
    await questionClient.delete(`/${questionId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return true;
  } catch {
    return false;
  }
};

export const setSelectedQuestionError = (
  error: string,
  dispatch: React.Dispatch<QuestionActions>
) => {
  dispatch({
    type: QuestionActionTypes.ERROR_FETCHING_SELECTED_QN,
    payload: error,
  });
};

export const createImageUrls = async (
  formData: FormData
): Promise<{ imageUrls: string[]; message: string } | null> => {
  try {
    const accessToken = localStorage.getItem("token");
    const response = await questionClient.post("/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch {
    return null;
  }
};

const reducer = (
  state: QuestionsState,
  action: QuestionActions
): QuestionsState => {
  const { type } = action;

  switch (type) {
    case QuestionActionTypes.CREATE_QUESTION: {
      const { payload } = action;
      if (!isQuestion(payload)) {
        return state;
      }
      return { ...state, questions: [payload, ...state.questions] };
    }
    case QuestionActionTypes.VIEW_QUESTION_CATEGORIES: {
      const { payload } = action;
      if (!isStringArray(payload)) {
        return state;
      }
      return { ...state, questionCategories: payload };
    }
    case QuestionActionTypes.VIEW_QUESTION_LIST: {
      const { payload } = action;
      if (!isQuestionList(payload)) {
        return state;
      }
      return {
        ...state,
        questions: payload.questions,
        questionCount: payload.questionCount,
      };
    }
    case QuestionActionTypes.VIEW_QUESTION: {
      const { payload } = action;
      if (!isQuestion(payload)) {
        return state;
      }
      return { ...state, selectedQuestion: payload };
    }
    case QuestionActionTypes.UPDATE_QUESTION: {
      const { payload } = action;
      if (!isQuestion(payload)) {
        return state;
      }
      return {
        ...state,
        questions: state.questions.map((question) =>
          question.id === payload.id ? payload : question
        ),
      };
    }
    case QuestionActionTypes.ERROR_CREATING_QUESTION: {
      const { payload } = action;
      if (!isString(payload)) {
        return state;
      }
      return { ...state, selectedQuestionError: payload };
    }
    case QuestionActionTypes.ERROR_FETCHING_QUESTION_CATEGORIES: {
      const { payload } = action;
      if (!isString(payload)) {
        return state;
      }
      return { ...state, questionCategoriesError: payload };
    }
    case QuestionActionTypes.ERROR_FETCHING_QUESTION_LIST: {
      const { payload } = action;
      if (!isString(payload)) {
        return state;
      }
      return { ...state, questionListError: payload };
    }
    case QuestionActionTypes.ERROR_FETCHING_SELECTED_QN: {
      const { payload } = action;
      if (!isString(payload)) {
        return state;
      }
      return { ...state, selectedQuestionError: payload };
    }
    case QuestionActionTypes.ERROR_UPDATING_QUESTION: {
      const { payload } = action;
      if (!isString(payload)) {
        return state;
      }
      return { ...state, selectedQuestionError: payload };
    }
    default:
      return state;
  }
};

export default reducer;
