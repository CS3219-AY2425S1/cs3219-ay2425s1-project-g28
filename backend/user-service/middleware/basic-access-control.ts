import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { findUserById as _findUserById } from "../model/repository";
import { AuthenticatedRequest } from "../types/request";

export function verifyAccessToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication failed" });
  }

  // request auth header: `Authorization: Bearer + <access_token>`
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET as string, async (err, user) => {
    if (err || !user || typeof user === "string") {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // load latest user info from DB
    const dbUser = await _findUserById(user.id);
    if (!dbUser) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    req.user = {
      id: dbUser.id,
      username: dbUser.username,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      biography: dbUser.biography,
      profilePictureUrl: dbUser.profilePictureUrl,
      isAdmin: dbUser.isAdmin,
    };
    next();
  });
}

export function verifyIsAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.isAdmin) {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Not authorized to access this resource" });
  }
}

export function verifyIsOwnerOrAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.isAdmin) {
    return next();
  }

  const userIdFromReqParams = req.params.id;
  const userIdFromToken = req.user?.id;

  if (userIdFromReqParams === userIdFromToken) {
    return next();
  }

  return res
    .status(403)
    .json({ message: "Not authorized to access this resource" });
}
