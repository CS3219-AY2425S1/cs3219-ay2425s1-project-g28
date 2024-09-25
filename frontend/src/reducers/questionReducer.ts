import { Dispatch } from "react";
import { questionClient } from "../utils/api";
import { isString, isStringArray } from "../utils/typeChecker";

type QuestionDetail = {
  id: string;
  title: string;
  description: string;
  complexity: string;
  categories: Array<string>;
};

type QuestionList = {
  questions: Array<QuestionDetail>;
  questionCount: number;
};

enum QuestionActionTypes {
  VIEW_QUESTION_CATEGORIES = "view_question_categories",
  VIEW_QUESTION_LIST = "view_question_list",
  VIEW_QUESTION = "view_question",
  DELETE_QUESTION = "delete_question",
  ERROR_FETCHING_QUESTION_CATEGORIES = "error_fetching_question_categories",
  ERROR_FETCHING_QUESTION_LIST = "error_fetching_question_list",
  ERROR_FETCHING_SELECTED_QN = "error_fetching_selected_qn",
  ERROR_DELETING_QUESTION = "error_deleting_question",
}

type QuestionActions = {
  type: QuestionActionTypes;
  payload: QuestionList | QuestionDetail | string[] | string;
};

type QuestionsState = {
  questionCategories: Array<string>;
  questions: Array<QuestionDetail>;
  questionCount: number;
  selectedQuestion: QuestionDetail | null;
  questionCategoriesError: string | null;
  questionListError: string | null;
  selectedQuestionError: string | null;
  deleteQuestionError: string | null;
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
  deleteQuestionError: null,
};

export const getQuestionCategories = (
  dispatch: Dispatch<QuestionActions>
) => {
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
        payload: err.response.data.message,
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
    .get("", {params: {
      page: page,
      qnLimit: qnLimit,
      title: title,
      complexities: complexities,
      categories: categories,
    }})
    .then((res) =>
      dispatch({ 
        type: QuestionActionTypes.VIEW_QUESTION_LIST, 
        payload: res.data,
      })
    )
    .catch((err) =>
      dispatch({
        type: QuestionActionTypes.ERROR_FETCHING_QUESTION_LIST,
        payload: err.response.data.message,
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
        payload: err.response.data.message,
      })
    );
};

export const deleteQuestionById = (
  questionId: string,
  dispatch: Dispatch<QuestionActions>
) => {
  return questionClient
    .delete(`/${questionId}`)
    .then((res) => {
      dispatch({ 
        type: QuestionActionTypes.DELETE_QUESTION, 
        payload: res.data,
      });
      return true;
    })
    .catch((err) => {
      dispatch({
        type: QuestionActionTypes.ERROR_DELETING_QUESTION,
        payload: err.response.data.message,
      });
      return false;
    });
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

const reducer = (
  state: QuestionsState,
  action: QuestionActions,
): QuestionsState => {
  const { type } = action;

  switch (type) {
    case QuestionActionTypes.VIEW_QUESTION_CATEGORIES: {
      const { payload } = action;
      if (!isStringArray(payload)) {
        return state;
      }
      return {
        ...state,
        questionCategories: payload,
        questionCategoriesError: null,
      };
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
        questionListError: null,
      };
    }
    case QuestionActionTypes.VIEW_QUESTION: {
      const { payload } = action;
      if (!isQuestion(payload)) {
        return state;
      }
      return { 
        ...state, 
        selectedQuestion: payload,
        selectedQuestionError: null,
      };
    }
    case QuestionActionTypes.DELETE_QUESTION: {
      const { payload } = action;
      if (!isString(payload)) {
        return state;
      }
      return { 
        ...state,
        deleteQuestionError: null,
      };
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
    case QuestionActionTypes.ERROR_DELETING_QUESTION: {
      const { payload } = action;
      if (!isString(payload)) {
        return state;
      }
      return { ...state, deleteQuestionError: payload };
    }
  }
};

export default reducer;
