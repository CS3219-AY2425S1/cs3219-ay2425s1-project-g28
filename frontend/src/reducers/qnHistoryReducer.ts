import { Dispatch } from "react";
import { qnHistoryClient } from "../utils/api";
import { isString, isStringArray } from "../utils/typeChecker";

type QnHistoryDetail = {
  id: string;
  userIds: Array<string>;
  questionId: string;
  title: string;
  submissionStatus: string;
  dateAttempted: string;
  timeTaken: number;
  code: string;
  language: string;
};

type QnHistoryList = {
  qnHistories: Array<QnHistoryDetail>;
  qnHistoryCount: number;
};

enum QnHistoryActionTypes {
  CREATE_QNHIST = "create_qnhist",
  VIEW_QNHIST_LIST = "view_qnhist_list",
  VIEW_QNHIST = "view_qnhist",
  UPDATE_QNHIST = "update_qnhist",
  ERROR_CREATING_QNHIST = "error_creating_qnhist",
  ERROR_FETCHING_QNHIST_LIST = "error_fetching_qnhist_list",
  ERROR_FETCHING_SELECTED_QNHIST = "error_fetching_selected_qnhist",
  ERROR_UPDATING_QNHIST = "error_updating_qnhist",
}

type QnHistoryActions = {
  type: QnHistoryActionTypes;
  payload: QnHistoryList | QnHistoryDetail | string[] | string;
};

type QnHistoriesState = {
  qnHistories: Array<QnHistoryDetail>;
  qnHistoryCount: number;
  selectedQnHistory: QnHistoryDetail | null;
  qnHistoryListError: string | null;
  selectedQnHistoryError: string | null;
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const isQnHistory = (qnHistory: any): qnHistory is QnHistoryDetail => {
  if (!qnHistory || typeof qnHistory !== "object") {
    return false;
  }

  return (
    isString(qnHistory.id) &&
    isStringArray(qnHistory.userIds) &&
    isString(qnHistory.questionId) &&
    isString(qnHistory.title) &&
    isString(qnHistory.submissionStatus) &&
    isString(qnHistory.dateAttempted) &&
    Object.prototype.toString.call(new Date(qnHistory.dateAttempted)) ===
      "[object Date]" &&
    !isNaN(new Date(qnHistory.dateAttempted).getTime()) &&
    typeof qnHistory.timeTaken === "number" &&
    isString(qnHistory.code) &&
    isString(qnHistory.language)
  );
};

const isQnHistoryList = (
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  qnHistoryList: any
): qnHistoryList is QnHistoryList => {
  if (!qnHistoryList || typeof qnHistoryList !== "object") {
    return false;
  }

  return (
    Array.isArray(qnHistoryList.qnHistories) &&
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    qnHistoryList.qnHistories.every((qnHistory: any) =>
      isQnHistory(qnHistory)
    ) &&
    typeof qnHistoryList.qnHistoryCount === "number"
  );
};

export const initialQHState: QnHistoriesState = {
  qnHistories: [],
  qnHistoryCount: 0,
  selectedQnHistory: null,
  qnHistoryListError: null,
  selectedQnHistoryError: null,
};

export const createQnHistory = async (
  qnHistory: Omit<QnHistoryDetail, "id">,
  dispatch: Dispatch<QnHistoryActions>
): Promise<string> => {
  return qnHistoryClient
    .post("/", {
      userIds: qnHistory.userIds,
      questionId: qnHistory.questionId,
      title: qnHistory.title,
      submissionStatus: qnHistory.submissionStatus,
      dateAttempted: qnHistory.dateAttempted,
      timeTaken: qnHistory.timeTaken,
      code: qnHistory.code,
      language: qnHistory.language,
    })
    .then((res) => {
      dispatch({
        type: QnHistoryActionTypes.CREATE_QNHIST,
        payload: res.data,
      });
      return res.data.qnHistory.id;
    })
    .catch((err) => {
      dispatch({
        type: QnHistoryActionTypes.ERROR_CREATING_QNHIST,
        payload: err.response?.data.message || err.message,
      });
      return "";
    });
};

export const getQnHistoryList = (
  page: number,
  qnHistLimit: number,
  userId: string,
  title: string,
  status: string[],
  order: number,
  dispatch: Dispatch<QnHistoryActions>
) => {
  qnHistoryClient
    .get("", {
      params: {
        page: page,
        qnHistLimit: qnHistLimit,
        userId: userId,
        title: title,
        status: status,
        order: order,
      },
    })
    .then((res) => {
      console.log(res.data);
      dispatch({
        type: QnHistoryActionTypes.VIEW_QNHIST_LIST,
        payload: res.data,
      });
    })
    .catch((err) =>
      dispatch({
        type: QnHistoryActionTypes.ERROR_FETCHING_QNHIST_LIST,
        payload: err.response?.data.message || err.message,
      })
    );
};

export const getQnHistoryById = (
  qnHistoryId: string,
  dispatch: Dispatch<QnHistoryActions>
) => {
  qnHistoryClient
    .get(`/${qnHistoryId}`)
    .then((res) => {
      dispatch({
        type: QnHistoryActionTypes.VIEW_QNHIST,
        payload: res.data.qnHistory,
      });
    })
    .catch((err) =>
      dispatch({
        type: QnHistoryActionTypes.ERROR_FETCHING_SELECTED_QNHIST,
        payload: err.response?.data.message || err.message,
      })
    );
};

export const updateQnHistoryById = async (
  qnHistoryId: string,
  qnHistory: Omit<
    QnHistoryDetail,
    "id" | "userIds" | "questionId" | "title" | "language"
  >,
  dispatch: Dispatch<QnHistoryActions>
): Promise<boolean> => {
  return qnHistoryClient
    .put(`/${qnHistoryId}`, {
      submissionStatus: qnHistory.submissionStatus,
      dateAttempted: qnHistory.dateAttempted,
      timeTaken: qnHistory.timeTaken,
      code: qnHistory.code,
    })
    .then((res) => {
      dispatch({
        type: QnHistoryActionTypes.UPDATE_QNHIST,
        payload: res.data,
      });
      return true;
    })
    .catch((err) => {
      dispatch({
        type: QnHistoryActionTypes.ERROR_UPDATING_QNHIST,
        payload: err.response?.data.message || err.message,
      });
      return false;
    });
};

export const deleteQuestionById = async (qnHistoryId: string) => {
  try {
    await qnHistoryClient.delete(`/${qnHistoryId}`);
    return true;
  } catch {
    return false;
  }
};

export const setSelectedQnHistoryError = (
  error: string,
  dispatch: React.Dispatch<QnHistoryActions>
) => {
  dispatch({
    type: QnHistoryActionTypes.ERROR_FETCHING_SELECTED_QNHIST,
    payload: error,
  });
};

const qnHistoryReducer = (
  state: QnHistoriesState,
  action: QnHistoryActions
): QnHistoriesState => {
  const { type } = action;

  switch (type) {
    case QnHistoryActionTypes.CREATE_QNHIST: {
      const { payload } = action;
      if (!isQnHistory(payload)) {
        return state;
      }
      return { ...state, qnHistories: [payload, ...state.qnHistories] };
    }
    case QnHistoryActionTypes.VIEW_QNHIST_LIST: {
      const { payload } = action;
      if (!isQnHistoryList(payload)) {
        return state;
      }
      return {
        ...state,
        qnHistories: payload.qnHistories,
        qnHistoryCount: payload.qnHistoryCount,
      };
    }
    case QnHistoryActionTypes.VIEW_QNHIST: {
      const { payload } = action;
      if (!isQnHistory(payload)) {
        return state;
      }
      return { ...state, selectedQnHistory: payload };
    }
    case QnHistoryActionTypes.UPDATE_QNHIST: {
      const { payload } = action;
      if (!isQnHistory(payload)) {
        return state;
      }
      return {
        ...state,
        qnHistories: state.qnHistories.map((qnHistory) =>
          qnHistory.id === payload.id ? payload : qnHistory
        ),
      };
    }
    case QnHistoryActionTypes.ERROR_CREATING_QNHIST: {
      const { payload } = action;
      if (!isString(payload)) {
        return state;
      }
      return { ...state, selectedQnHistoryError: payload };
    }
    case QnHistoryActionTypes.ERROR_FETCHING_QNHIST_LIST: {
      const { payload } = action;
      if (!isString(payload)) {
        return state;
      }
      return { ...state, qnHistoryListError: payload };
    }
    case QnHistoryActionTypes.ERROR_FETCHING_SELECTED_QNHIST: {
      const { payload } = action;
      if (!isString(payload)) {
        return state;
      }
      return { ...state, selectedQnHistoryError: payload };
    }
    case QnHistoryActionTypes.ERROR_UPDATING_QNHIST: {
      const { payload } = action;
      if (!isString(payload)) {
        return state;
      }
      return { ...state, selectedQnHistoryError: payload };
    }
    default:
      return state;
  }
};

export default qnHistoryReducer;
