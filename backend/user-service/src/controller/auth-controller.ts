import { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail as _findUserByEmail } from "../model/repository";
import { formatUserResponse } from "./user-controller";
import { AuthenticatedRequest } from "../types/request";

export async function handleLogin(
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await _findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      if (!user.isVerified) {
        return res.status(401).json({
          message: "User not verified.",
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      const accessToken = jwt.sign(
        { id: user.id, admin: user.isAdmin },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );
      return res.status(200).json({
        message: "User logged in",
        data: { accessToken, user: formatUserResponse(user) },
      });
    } catch (err) {
      return res.status(500).json({ message: "Server error", err });
    }
  } else {
    return res.status(400).json({ message: "Missing email and/or password" });
  }
}

export async function handleVerifyToken(
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> {
  try {
    const verifiedUser = req.user;
    return res
      .status(200)
      .json({ message: "Token verified", data: verifiedUser });
  } catch (err) {
    return res.status(500).json({ message: "Server error", err });
  }
}
