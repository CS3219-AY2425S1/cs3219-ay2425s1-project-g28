/* eslint-disable */

import {
  BIO_MAX_LENGTH_ERROR_MESSAGE,
  EMAIL_INVALID_ERROR_MESSAGE,
  EMAIL_REQUIRED_ERROR_MESSAGE,
  NAME_ALLOWED_CHAR_ERROR_MESSAGE,
  NAME_MAX_LENGTH_ERROR_MESSAGE,
  NAME_REQUIRED_ERROR_MESSAGE,
  PASSWORD_DIGIT_ERROR_MESSAGE,
  PASSWORD_LOWER_CASE_ERROR_MESSAGE,
  PASSWORD_MIN_LENGTH_ERROR_MESSAGE,
  PASSWORD_SPECIAL_CHAR_ERROR_MESSAGE,
  PASSWORD_UPPER_CASE_ERROR_MESSAGE,
  PASSWORD_WEAK_ERROR_MESSAGE,
  PROFILE_PIC_MAX_SIZE_ERROR_MESSAGE,
  USERNAME_ALLOWED_CHAR_ERROR_MESSAGE,
  USERNAME_LENGTH_ERROR_MESSAGE,
} from "./constants";

export const nameValidator = (value: string) => {
  if (value.length === 0) {
    return NAME_REQUIRED_ERROR_MESSAGE;
  }

  if (value.length > 50) {
    return NAME_MAX_LENGTH_ERROR_MESSAGE;
  }

  if (!/^[a-zA-Z\s-]*$/.test(value)) {
    return NAME_ALLOWED_CHAR_ERROR_MESSAGE;
  }

  return true;
};

export const usernameValidator = (value: string) => {
  if (value.length < 6 || value.length > 30) {
    return USERNAME_LENGTH_ERROR_MESSAGE;
  }

  if (!/^[a-zA-Z0-9._]+$/.test(value)) {
    return USERNAME_ALLOWED_CHAR_ERROR_MESSAGE;
  }

  return true;
};

export const emailValidator = (value: string) => {
  if (value.length === 0) {
    return EMAIL_REQUIRED_ERROR_MESSAGE;
  }

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    return EMAIL_INVALID_ERROR_MESSAGE;
  }

  return true;
};

export const bioValidator = (value: string) => {
  if (value.length > 255) {
    return BIO_MAX_LENGTH_ERROR_MESSAGE;
  }

  return true;
};

export const profilePictureValidator = (value: File | null) => {
  if (value && value.size > 5 * 1024 * 1024) {
    return PROFILE_PIC_MAX_SIZE_ERROR_MESSAGE;
  }

  return true;
};

const minLengthValidator = (value: string) => {
  return value.length >= 8;
};

const lowerCaseValidator = (value: string) => {
  return /[a-z]/.test(value);
};

const upperCaseValidator = (value: string) => {
  return /[A-Z]/.test(value);
};

const digitValidator = (value: string) => {
  return /\d/.test(value);
};

const specialCharValidator = (value: string) => {
  return /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(value);
};

export const passwordValidator = (value: string) => {
  if (
    value &&
    (!minLengthValidator(value) ||
      !lowerCaseValidator(value) ||
      !upperCaseValidator(value) ||
      !digitValidator(value) ||
      !specialCharValidator(value))
  ) {
    return PASSWORD_WEAK_ERROR_MESSAGE;
  }

  return true;
};

export const passwordValidators = [
  { validate: minLengthValidator, message: PASSWORD_MIN_LENGTH_ERROR_MESSAGE },
  { validate: lowerCaseValidator, message: PASSWORD_LOWER_CASE_ERROR_MESSAGE },
  { validate: upperCaseValidator, message: PASSWORD_UPPER_CASE_ERROR_MESSAGE },
  { validate: digitValidator, message: PASSWORD_DIGIT_ERROR_MESSAGE },
  {
    validate: specialCharValidator,
    message: PASSWORD_SPECIAL_CHAR_ERROR_MESSAGE,
  },
];
