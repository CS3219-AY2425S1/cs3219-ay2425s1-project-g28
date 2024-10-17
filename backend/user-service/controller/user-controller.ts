import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { isValidObjectId } from "mongoose";
import {
  createUser as _createUser,
  deleteUserById as _deleteUserById,
  findAllUsers as _findAllUsers,
  findUserByEmail as _findUserByEmail,
  findUserById as _findUserById,
  findUserByUsername as _findUserByUsername,
  findUserByUsernameOrEmail as _findUserByUsernameOrEmail,
  updateUserById as _updateUserById,
  updateUserPrivilegeById as _updateUserPrivilegeById,
  updateUserVerification as _updateUserVerification,
} from "../model/repository";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateName,
  validateBiography,
} from "../utils/validators";
import { IUser } from "../model/user-model";
import { upload } from "../config/multer";
import { uploadFileToFirebase } from "../utils/utils";
import redisClient from "../config/redis";
import crypto from "crypto";
import { sendMail } from "../utils/mailer";
import { ACCOUNT_VERIFICATION_SUBJ } from "../utils/constants";

export async function createUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    const existingUser = await _findUserByUsernameOrEmail(username, email);
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    if (firstName && lastName && username && email && password) {
      const { isValid: isValidFirstName, message: firstNameMessage } =
        validateName(firstName, "first name");
      if (!isValidFirstName) {
        return res.status(400).json({ message: firstNameMessage });
      }

      const { isValid: isValidLastName, message: lastNameMessage } =
        validateName(lastName, "last name");
      if (!isValidLastName) {
        return res.status(400).json({ message: lastNameMessage });
      }

      const { isValid: isValidUsername, message: usernameMessage } =
        validateUsername(username);
      if (!isValidUsername) {
        return res.status(400).json({ message: usernameMessage });
      }

      const { isValid: isValidEmail, message: emailMessage } =
        validateEmail(email);
      if (!isValidEmail) {
        return res.status(400).json({ message: emailMessage });
      }

      const { isValid: isValidPassword, message: passwordMessage } =
        validatePassword(password);
      if (!isValidPassword) {
        return res.status(400).json({ message: passwordMessage });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      const createdUser = await _createUser(
        firstName,
        lastName,
        username,
        email,
        hashedPassword
      );

      const emailToken = crypto.randomBytes(16).toString("hex");
      await redisClient.set(email, emailToken, { EX: 60 * 5 }); // expire in 5 minutes
      const emailText = `Hello ${username},\n\n
      Please click on the following link to verify your account:\n\nhttp://localhost:3001/api/users/verify-email/${email}/${emailToken}\n\n
      If you did not request this, please ignore this email.`;
      await sendMail(email, ACCOUNT_VERIFICATION_SUBJ, emailText);

      return res.status(201).json({
        message: `Created new user ${username} successfully`,
        data: formatUserResponse(createdUser),
      });
    } else {
      return res.status(400).json({
        message:
          "At least one of first name, last name, username, email and password are missing",
      });
    }
  } catch {
    return res
      .status(500)
      .json({ message: "Unknown error when creating new user!" });
  }
}

export const verifyUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, token } = req.params;

    const user = await _findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: `User ${email} not found` });
    }

    const expectedToken = await redisClient.get(email);

    if (expectedToken !== token) {
      return res
        .status(400)
        .json({ message: "Invalid token. Please request for a new one." });
    }

    const updatedUser = await _updateUserVerification(email);
    if (!updatedUser) {
      return res.status(404).json({ message: `User ${email} not verified.` });
    }

    return res
      .status(200)
      .json({ message: `User ${email} verified successfully.` });
  } catch {
    return res
      .status(500)
      .json({ message: "Unknown error when verifying user!" });
  }
};

export const createImageLink = async (
  req: Request,
  res: Response
): Promise<void> => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to upload image", error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    try {
      const file = req.file as Express.Multer.File;
      const imageUrl = await uploadFileToFirebase("profilePics/", file);

      return res
        .status(200)
        .json({ message: "Image uploaded successfully", imageUrl: imageUrl });
    } catch (error) {
      return res.status(500).json({ message: "Server error", error });
    }
  });
};

export async function getUser(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    } else {
      return res
        .status(200)
        .json({ message: `Found user`, data: formatUserResponse(user) });
    }
  } catch {
    return res
      .status(500)
      .json({ message: "Unknown error when getting user!" });
  }
}

export async function getAllUsers(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const users = await _findAllUsers();

    return res
      .status(200)
      .json({ message: `Found users`, data: users.map(formatUserResponse) });
  } catch {
    return res
      .status(500)
      .json({ message: "Unknown error when getting all users!" });
  }
}

export async function updateUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const {
      oldPassword,
      newPassword,
      profilePictureUrl,
      firstName,
      lastName,
      biography,
    } = req.body;
    if (
      (oldPassword && newPassword) ||
      profilePictureUrl ||
      firstName ||
      lastName ||
      biography
    ) {
      const userId = req.params.id;

      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      let hashedPassword: string | undefined;
      if (oldPassword && newPassword) {
        const match = await bcrypt.compare(oldPassword, user.password);
        if (!match) {
          return res
            .status(403)
            .json({ message: "Wrong current password given" });
        }

        const { isValid: isValidPassword, message: passwordMessage } =
          validatePassword(newPassword);
        if (!isValidPassword) {
          return res.status(400).json({ message: passwordMessage });
        }

        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(newPassword, salt);
      }

      if (firstName) {
        const { isValid: isValidFirstName, message: firstNameMessage } =
          validateName(firstName, "first name");
        if (!isValidFirstName) {
          return res.status(400).json({ message: firstNameMessage });
        }
      }

      if (lastName) {
        const { isValid: isValidLastName, message: lastNameMessage } =
          validateName(lastName, "last name");
        if (!isValidLastName) {
          return res.status(400).json({ message: lastNameMessage });
        }
      }

      if (biography) {
        const { isValid: isValidBiography, message: biographyMessage } =
          validateBiography(biography);
        if (!isValidBiography) {
          return res.status(400).json({ message: biographyMessage });
        }
      }

      const updatedUser = await _updateUserById(
        userId,
        hashedPassword,
        profilePictureUrl,
        firstName,
        lastName,
        biography
      );
      return res.status(200).json({
        message: `Updated data for user ${userId}`,
        data: formatUserResponse(updatedUser as IUser),
      });
    } else {
      return res.status(400).json({
        message:
          "No field to update. Update one of the following fields: username, email, password, profilePictureUrl, firstName, lastName, biography",
      });
    }
  } catch {
    return res
      .status(500)
      .json({ message: "Unknown error when updating user!" });
  }
}

export async function updateUserPrivilege(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { isAdmin } = req.body;

    if (isAdmin !== undefined) {
      // isAdmin can have boolean value true or false
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await _findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      const updatedUser = await _updateUserPrivilegeById(
        userId,
        isAdmin === true
      );
      return res.status(200).json({
        message: `Updated privilege for user ${userId}`,
        data: formatUserResponse(updatedUser as IUser),
      });
    } else {
      return res.status(400).json({ message: "isAdmin is missing!" });
    }
  } catch {
    return res
      .status(500)
      .json({ message: "Unknown error when updating user privilege!" });
  }
}

export async function deleteUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }
    const user = await _findUserById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    await _deleteUserById(userId);
    return res
      .status(200)
      .json({ message: `Deleted user ${userId} successfully` });
  } catch {
    return res
      .status(500)
      .json({ message: "Unknown error when deleting user!" });
  }
}

export function formatUserResponse(user: IUser) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,

    profilePictureUrl: user.profilePictureUrl,
    firstName: user.firstName,
    lastName: user.lastName,
    biography: user.biography,
  };
}
