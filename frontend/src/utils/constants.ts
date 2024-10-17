/* Dropdowns */
export const complexityList: string[] = ["Easy", "Medium", "Hard"];
export const languageList = ["Python", "Java"];

/* Context Provider Errors */
export const USE_AUTH_ERROR_MESSAGE =
  "useAuth() must be used within AuthProvider";
export const USE_PROFILE_ERROR_MESSAGE =
  "useProfile() must be used within ProfileContextProvider";

/* Name Validation */
export const NAME_REQUIRED_ERROR_MESSAGE = "Name is required";
export const NAME_MAX_LENGTH_ERROR_MESSAGE =
  "Name must be at most 50 characters long";
export const NAME_ALLOWED_CHAR_ERROR_MESSAGE =
  "Name must contain only alphabetical, hyphen and white space characters";

/* Username Validation */
export const USERNAME_LENGTH_ERROR_MESSAGE =
  "Username must be between 6 and 30 characters long";
export const USERNAME_ALLOWED_CHAR_ERROR_MESSAGE =
  "Username must contain only alphanumeric, underscore and full stop characters";

/* Email Validation */
export const EMAIL_REQUIRED_ERROR_MESSAGE = "Email is required";
export const EMAIL_INVALID_ERROR_MESSAGE = "Email is invalid";

/* Biography Validation */
export const BIO_MAX_LENGTH_ERROR_MESSAGE =
  "Biography must be at most 255 characters long";

/* Profile Picture Validation */
export const PROFILE_PIC_MAX_SIZE_ERROR_MESSAGE =
  "*Profile picture file size should be no more than 5MB";

/* Password Validation */
export const PASSWORD_REQUIRED_ERROR_MESSAGE = "Password is required";
export const PASSWORD_MIN_LENGTH_ERROR_MESSAGE =
  "Password must be at least 8 characters long";
export const PASSWORD_LOWER_CASE_ERROR_MESSAGE =
  "Password must contain at least 1 lowercase letter";
export const PASSWORD_UPPER_CASE_ERROR_MESSAGE =
  "Password must contain at least 1 uppercase letter";
export const PASSWORD_DIGIT_ERROR_MESSAGE =
  "Password must contain at least 1 digit";
export const PASSWORD_SPECIAL_CHAR_ERROR_MESSAGE =
  "Password must contain at least 1 special character";
export const PASSWORD_WEAK_ERROR_MESSAGE = "Password is weak";
export const PASSWORD_MISMATCH_ERROR_MESSAGE = "Password does not match";

/* Toast Messages */
// Authentication
export const SUCCESS_LOG_OUT = "Logged out successfully!";
export const SUCCESSFUL_SIGNUP =
  "User created successfully. Please verify your email address.";

// Field Validation
export const FILL_ALL_FIELDS = "Please fill in all fields";

export const minMatchTimeout = 30;
export const maxMatchTimeout = 300;

// Question
export const SUCCESS_QUESTION_CREATE = "Question created successfully";
export const FAILED_QUESTION_CREATE = "Failed to create question";
export const NO_QUESTION_CHANGES =
  "You have not made any changes to the question";
export const SUCCESS_QUESTION_UPDATE = "Question updated successfully";
export const FAILED_QUESTION_UPDATE = "Failed to update question";
export const SUCCESS_QUESTION_DELETE = "Question deleted successfully";
export const FAILED_QUESTION_DELETE = "Failed to delete question";
export const SUCCESS_FILE_UPLOAD = "File uploaded successfully";
export const FAILED_FILE_UPLOAD = "Failed to upload file";

// Profile
export const SUCCESS_PW_UPDATE_MESSAGE = "Password updated successfully";
export const FAILED_PW_UPDATE_MESSAGE = "Failed to update password";
export const SUCCESS_PROFILE_UPDATE_MESSAGE = "Profile updated successfully";
export const FAILED_PROFILE_UPDATE_MESSAGE = "Failed to update profile";

// Image paths
export const FIND_MATCH_FORM_PATH = "/find_match_form.png";
export const MATCH_FOUND_PATH = "/match_found.png";
export const QUESTIONS_LIST_PATH = "/questions_list.png";
export const COLLABORATIVE_EDITOR_PATH = "/collaborative_editor.png";
