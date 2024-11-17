import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
    profilePictureUrl?: string;
    firstName?: string;
    lastName?: string;
    biography?: string;
  };
}
