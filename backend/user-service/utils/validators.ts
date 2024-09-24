import validator from "validator";

export function validateEmail(email: string): {
  isValid: boolean;
  message: string | null;
} {
  if (!validator.isEmail(email)) {
    return { isValid: false, message: "Email format is invalid" };
  }
  return { isValid: true, message: null };
}

export function validatePassword(password: string): {
  isValid: boolean;
  message: string | null;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least 1 lowercase letter",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least 1 uppercase letter",
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least 1 digit",
    };
  }

  if (!/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least 1 special character",
    };
  }

  return { isValid: true, message: null };
}

export function validateUsername(username: string): {
  isValid: boolean;
  message: string | null;
} {
  if (!validator.isLength(username, { min: 6, max: 30 })) {
    return {
      isValid: false,
      message: "Username must be between 6 and 30 characters long",
    };
  }

  if (!/^[a-zA-Z0-9._]+$/.test(username)) {
    return {
      isValid: false,
      message:
        "Username must only contain alphanumeric characters, underscores, and full stops",
    };
  }

  return { isValid: true, message: null };
}

export function validateName(
  name: string,
  type: "first name" | "last name"
): { isValid: boolean; message: string | null } {
  if (!validator.isLength(name, { max: 50 })) {
    return {
      isValid: false,
      message: `${type} must be at most 50 characters long`,
    };
  }

  if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    return {
      isValid: false,
      message: `${type} must only contain alphanumeric characters and white spaces`,
    };
  }

  return { isValid: true, message: null };
}

export function validateBiography(biography: string): {
  isValid: boolean;
  message: string | null;
} {
  if (!validator.isLength(biography, { max: 255 })) {
    return {
      isValid: false,
      message: "Biography must be at most 255 characters long",
    };
  }

  return { isValid: true, message: null };
}
