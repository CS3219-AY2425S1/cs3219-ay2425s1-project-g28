import { Request, Response } from "express";
import QnHistory, { IQnHistory } from "../models/QnHistory.ts";
import {
  MONGO_OBJ_ID_FORMAT,
  MONGO_OBJ_ID_MALFORMED_MESSAGE,
  PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE,
  PAGE_LIMIT_USERID_REQUIRED_MESSAGE,
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
      language,
    } = req.body;

    const newQnHistory = new QnHistory({
      userIds,
      questionId,
      title,
      submissionStatus,
      dateAttempted,
      timeTaken,
      language,
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
};

export const readQnHistoryList = async (
  req: Request<unknown, unknown, unknown, QnHistListParams>,
  res: Response
): Promise<void> => {
  try {
    const { page, qnHistLimit, userId } = req.query;

    if (!page || !qnHistLimit || !userId) {
      res.status(400).json({ message: PAGE_LIMIT_USERID_REQUIRED_MESSAGE });
      return;
    }

    const pageInt = parseInt(page, 10);
    const qnHistLimitInt = parseInt(qnHistLimit, 10);

    if (pageInt < 1 || qnHistLimitInt < 1) {
      res.status(400).json({ message: PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE });
      return;
    }

    const filteredQnHistCount = await QnHistory.countDocuments({
      userIds: userId,
    });
    const filteredQnHist = await QnHistory.find({ userIds: userId })
      .skip((pageInt - 1) * qnHistLimitInt)
      .limit(qnHistLimitInt);

    res.status(200).json({
      message: QN_HIST_RETRIEVED_MESSAGE,
      qnHistoryCount: filteredQnHistCount,
      qnHistories: filteredQnHist.map(formatQnHistoryResponse),
    });
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
  };
};
