import { Request, Response } from "express";
import Question, { IQuestion } from "../models/Question.ts";
import { checkIsExistingQuestion, sortAlphabetically } from "../utils/utils.ts";
import {
  DUPLICATE_QUESTION_MESSAGE,
  QN_DESC_EXCEED_CHAR_LIMIT_MESSAGE,
  QN_DESC_CHAR_LIMIT,
  QN_CREATED_MESSAGE,
  QN_NOT_FOUND_MESSAGE,
  QN_DELETED_MESSAGE,
  SERVER_ERROR_MESSAGE,
  QN_RETRIEVED_MESSAGE,
  PAGE_LIMIT_REQUIRED_MESSAGE,
  PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE,
  CATEGORIES_RETRIEVED_MESSAGE,
  MONGO_OBJ_ID_FORMAT,
  MONGO_OBJ_ID_MALFORMED_MESSAGE,
} from "../utils/constants.ts";

import { upload } from "../../config/multer";
import { uploadFileToFirebase } from "../utils/utils";

export const createQuestion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, complexity, category } = req.body;

    const existingQuestion = await checkIsExistingQuestion(title);
    if (existingQuestion) {
      res.status(400).json({
        message: DUPLICATE_QUESTION_MESSAGE,
      });
      return;
    }

    if (description.length > QN_DESC_CHAR_LIMIT) {
      res.status(400).json({
        message: QN_DESC_EXCEED_CHAR_LIMIT_MESSAGE,
      });
      return;
    }

    const newQuestion = new Question({
      title,
      description,
      complexity,
      category,
    });

    await newQuestion.save();

    res.status(201).json({
      message: QN_CREATED_MESSAGE,
      question: formatQuestionResponse(newQuestion),
    });
  } catch (error) {
    res.status(500).json({ message: SERVER_ERROR_MESSAGE, error });
  }
};

export const createImageLink = async (
  req: Request,
  res: Response,
): Promise<void> => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to upload images", error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    try {
      const files = req.files as Express.Multer.File[];

      const uploadPromises = files.map((file) => uploadFileToFirebase(file));
      const imageUrls = await Promise.all(uploadPromises);
      console.log(imageUrls);
      return res
        .status(200)
        .json({ message: "Images uploaded successfully", imageUrls });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  });
};

export const updateQuestion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!id.match(MONGO_OBJ_ID_FORMAT)) {
      res.status(400).json({ message: MONGO_OBJ_ID_MALFORMED_MESSAGE });
      return;
    }

    const currentQuestion = await Question.findById(id);

    if (!currentQuestion) {
      res.status(404).json({ message: QN_NOT_FOUND_MESSAGE });
      return;
    }

    const existingQuestion = await checkIsExistingQuestion(title, id);
    if (existingQuestion) {
      res.status(400).json({
        message: DUPLICATE_QUESTION_MESSAGE,
      });
      return;
    }

    if (description && description.length > QN_DESC_CHAR_LIMIT) {
      res.status(400).json({
        message: QN_DESC_EXCEED_CHAR_LIMIT_MESSAGE,
      });
      return;
    }

    const updatedQuestion = await Question.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({
      message: "Question updated successfully",
      question: formatQuestionResponse(updatedQuestion as IQuestion),
    });
  } catch (error) {
    res.status(500).json({ message: SERVER_ERROR_MESSAGE, error });
  }
};

export const deleteQuestion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const currentQuestion = await Question.findById(id);
    if (!currentQuestion) {
      res.status(404).json({ message: QN_NOT_FOUND_MESSAGE });
      return;
    }

    await Question.findByIdAndDelete(id);
    res.status(200).json({ message: QN_DELETED_MESSAGE });
  } catch (error) {
    res.status(500).json({ message: SERVER_ERROR_MESSAGE, error });
  }
};

interface QnListSearchFilterParams {
  page: string;
  qnLimit: string;
  title?: string;
  complexities?: string | string[];
  categories?: string | string[];
}

export const readQuestionsList = async (
  req: Request<unknown, unknown, unknown, QnListSearchFilterParams>,
  res: Response,
): Promise<void> => {
  try {
    const { page, qnLimit, title, complexities, categories } = req.query;

    if (!page || !qnLimit) {
      res.status(400).json({ message: PAGE_LIMIT_REQUIRED_MESSAGE });
      return;
    }

    const pageInt = parseInt(page, 10);
    const qnLimitInt = parseInt(qnLimit, 10);

    if (pageInt < 1 || qnLimitInt < 1) {
      res.status(400).json({ message: PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE });
      return;
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const query: any = {};

    if (title) {
      query.title = { $regex: new RegExp(title, "i") };
    }

    if (complexities) {
      query.complexity = {
        $in: Array.isArray(complexities) ? complexities : [complexities],
      };
    }

    if (categories) {
      query.category = {
        $in: Array.isArray(categories) ? categories : [categories],
      };
    }

    const filteredQuestionCount = await Question.countDocuments(query);
    const filteredQuestions = await Question.find(query)
      .skip((pageInt - 1) * qnLimitInt)
      .limit(qnLimitInt);

    res.status(200).json({
      message: QN_RETRIEVED_MESSAGE,
      questionCount: filteredQuestionCount,
      questions: filteredQuestions
        .map(formatQuestionResponse)
        .map((question) => ({
          ...question,
          categories: sortAlphabetically(question.categories),
        })),
    });
  } catch (error) {
    res.status(500).json({ message: SERVER_ERROR_MESSAGE, error });
  }
};

export const readQuestionIndiv = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const questionDetails = await Question.findById(id);
    if (!questionDetails) {
      res.status(404).json({ message: QN_NOT_FOUND_MESSAGE });
      return;
    }

    res.status(200).json({
      message: QN_RETRIEVED_MESSAGE,
      question: formatQuestionResponse(questionDetails),
    });
  } catch (error) {
    res.status(500).json({ message: SERVER_ERROR_MESSAGE, error });
  }
};

export const readCategories = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    // const uniqueCats = await Question.distinct("category");

    // res.status(200).json({
    //   message: CATEGORIES_RETRIEVED_MESSAGE,
    //   categories: sortAlphabetically(uniqueCats),
    // });
    res
      .status(200)
      .json({
        message: CATEGORIES_RETRIEVED_MESSAGE,
        categories: [
          "Strings",
          "Algorithms",
          "Data Structures",
          "Bit Manipulation",
          "Recursion",
          "Databases",
          "Arrays",
          "Brainteaser",
        ],
      });
  } catch (error) {
    res.status(500).json({ message: SERVER_ERROR_MESSAGE, error });
  }
};

const formatQuestionResponse = (question: IQuestion) => {
  return {
    id: question._id,
    title: question.title,
    description: question.description,
    complexity: question.complexity,
    categories: question.category,
  };
};
