import { Request, Response } from "express";
import QnHistory, { IQnHistory } from "../models/QnHistory.ts";
import {
  MONGO_OBJ_ID_FORMAT,
  MONGO_OBJ_ID_MALFORMED_MESSAGE,
  ORDER_INCORRECT_FORMAT_MESSAGE,
  PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE,
  PAGE_LIMIT_USERID_ORDER_REQUIRED_MESSAGE,
  QN_HIST_CREATED_MESSAGE,
  QN_HIST_DELETED_MESSAGE,
  QN_HIST_NOT_FOUND_MESSAGE,
  QN_HIST_RETRIEVED_MESSAGE,
  SERVER_ERROR_MESSAGE,
} from "../utils/constants.ts";

export const createQnHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      userIds,
      questionId,
      title,
      submissionStatus,
      dateAttempted,
      timeTaken,
      code,
      language,
      //compilerRes,
    } = req.body;

    const newQnHistory = new QnHistory({
      userIds,
      questionId,
      title,
      submissionStatus,
      dateAttempted,
      timeTaken,
      code,
      language,
      //compilerRes,
    });

    await newQnHistory.save();

    res.status(201).json({
      message: QN_HIST_CREATED_MESSAGE,
      qnHistory: formatQnHistoryResponse(newQnHistory),
    });
  } catch (error) {
    res.status(500).json({ message: SERVER_ERROR_MESSAGE, error });
  }
};

export const updateQnHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.match(MONGO_OBJ_ID_FORMAT)) {
      res.status(400).json({ message: MONGO_OBJ_ID_MALFORMED_MESSAGE });
      return;
    }

    const currQnHistory = await QnHistory.findById(id);

    if (!currQnHistory) {
      res.status(404).json({ message: QN_HIST_NOT_FOUND_MESSAGE });
      return;
    }

    const updatedQnHistory = await QnHistory.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      message: "Question updated successfully",
      qnHistory: formatQnHistoryResponse(updatedQnHistory as IQnHistory),
    });
  } catch (error) {
    res.status(500).json({ message: SERVER_ERROR_MESSAGE, error });
  }
};

export const deleteQnHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.match(MONGO_OBJ_ID_FORMAT)) {
      res.status(400).json({ message: MONGO_OBJ_ID_MALFORMED_MESSAGE });
      return;
    }

    const currQnHistory = await QnHistory.findById(id);
    if (!currQnHistory) {
      res.status(404).json({ message: QN_HIST_NOT_FOUND_MESSAGE });
      return;
    }

    await QnHistory.findByIdAndDelete(id);
    res.status(200).json({ message: QN_HIST_DELETED_MESSAGE });
  } catch (error) {
    res.status(500).json({ message: SERVER_ERROR_MESSAGE, error });
  }
};

type QnHistListParams = {
  page: string;
  qnHistLimit: string;
  userId: string;
  title: string; //qn title search keyword
  status: string; //submission status
  order: string; //entries sort order
};

export const readQnHistoryList = async (
  req: Request<unknown, unknown, unknown, QnHistListParams>,
  res: Response
): Promise<void> => {
  try {
    const { page, qnHistLimit, userId, title, status, order } = req.query;

    if (!page || !qnHistLimit || !userId || !order) {
      res
        .status(400)
        .json({ message: PAGE_LIMIT_USERID_ORDER_REQUIRED_MESSAGE });
      return;
    }

    const pageInt = parseInt(page, 10);
    const qnHistLimitInt = parseInt(qnHistLimit, 10);
    const orderInt = parseInt(order, 10);

    if (pageInt < 1 || qnHistLimitInt < 1) {
      res.status(400).json({ message: PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE });
      return;
    }

    if (!(orderInt == 1 || orderInt == -1)) {
      res.status(400).json({ message: ORDER_INCORRECT_FORMAT_MESSAGE });
    }

    if (!userId.match(MONGO_OBJ_ID_FORMAT)) {
      res.status(400).json({ message: MONGO_OBJ_ID_MALFORMED_MESSAGE });
      return;
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const query: any = {};

    if (title) {
      query.title = { $regex: new RegExp(title, "i") };
    }

    if (status) {
      query.submissionStatus = {
        $in: Array.isArray(status) ? status : [status],
      };
    }

    query.userIds = { $in: [userId] };

    if (orderInt == 1) {
      //ascending order
      const filteredQnHistCount = await QnHistory.countDocuments(query);
      const filteredQnHist = await QnHistory.find(query)
        .sort({ dateAttempted: 1 })
        .skip((pageInt - 1) * qnHistLimitInt)
        .limit(qnHistLimitInt);

      res.status(200).json({
        message: QN_HIST_RETRIEVED_MESSAGE,
        qnHistoryCount: filteredQnHistCount,
        qnHistories: filteredQnHist.map(formatQnHistoryResponse),
      });
    } else {
      //descending order
      const filteredQnHistCount = await QnHistory.countDocuments(query);
      const filteredQnHist = await QnHistory.find(query)
        .sort({ dateAttempted: -1 })
        .skip((pageInt - 1) * qnHistLimitInt)
        .limit(qnHistLimitInt);

      res.status(200).json({
        message: QN_HIST_RETRIEVED_MESSAGE,
        qnHistoryCount: filteredQnHistCount,
        qnHistories: filteredQnHist.map(formatQnHistoryResponse),
      });
    }
  } catch (error) {
    res.status(500).json({ message: SERVER_ERROR_MESSAGE, error });
  }
};

export const readQnHistIndiv = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.match(MONGO_OBJ_ID_FORMAT)) {
      res.status(400).json({ message: MONGO_OBJ_ID_MALFORMED_MESSAGE });
      return;
    }

    const qnHistDetails = await QnHistory.findById(id);
    if (!qnHistDetails) {
      res.status(404).json({ message: QN_HIST_NOT_FOUND_MESSAGE });
      return;
    }

    res.status(200).json({
      message: QN_HIST_RETRIEVED_MESSAGE,
      qnHistory: formatQnHistoryResponse(qnHistDetails),
    });
  } catch (error) {
    res.status(500).json({ message: SERVER_ERROR_MESSAGE, error });
  }
};

const formatQnHistoryResponse = (qnHistory: IQnHistory) => {
  return {
    id: qnHistory._id,
    userIds: qnHistory.userIds,
    questionId: qnHistory.questionId,
    title: qnHistory.title,
    submissionStatus: qnHistory.submissionStatus,
    dateAttempted: qnHistory.dateAttempted,
    timeTaken: qnHistory.timeTaken,
    code: qnHistory.code,
    language: qnHistory.language,
    //compilerRes: qnHistory.compilerRes.map(formatCompilerRes),
  };
};

/*const formatCompilerRes = (compilerRes: ICompilerRes) => {
  return {
    status: compilerRes.status,
    exception: compilerRes.exception,
    stdout: compilerRes.stdout,
    stderr: compilerRes.stderr,
    executionTime: compilerRes.executionTime,
    stdin: compilerRes.stdin,
    stout: compilerRes.stdout,
    actualResult: compilerRes.actualResult,
    expectedResult: compilerRes.expectedResult,
    isMatch: compilerRes.isMatch,
  };
};*/
