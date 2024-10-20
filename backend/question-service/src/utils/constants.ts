export const QN_DESC_CHAR_LIMIT = 6000;

export const QN_DESC_EXCEED_CHAR_LIMIT_MESSAGE = `Question description must be at most ${QN_DESC_CHAR_LIMIT} characters`;

export const DUPLICATE_QUESTION_MESSAGE =
  "Duplicate question: A question with the same title already exists.";

export const QN_CREATED_MESSAGE = "Question created successfully.";

export const QN_NOT_FOUND_MESSAGE = "Question not found.";

export const QN_DELETED_MESSAGE = "Question deleted successfully.";

export const SERVER_ERROR_MESSAGE = "Server error.";

export const QN_RETRIEVED_MESSAGE = "Question retrieved successfully.";

export const PAGE_LIMIT_REQUIRED_MESSAGE =
  "Page number and question limit per page should be provided.";

export const PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE =
  "Page number and question limit per page should be positive integers.";

export const CATEGORIES_RETRIEVED_MESSAGE =
  "Categories retrieved successfully.";

export const MONGO_OBJ_ID_FORMAT = /^[0-9a-fA-F]{24}$/;

export const MONGO_OBJ_ID_MALFORMED_MESSAGE = "The question ID is not valid";
