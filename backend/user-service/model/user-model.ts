import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  isAdmin: boolean;

  profilePictureUrl?: string;
  firstName: string;
  lastName: string;
  biography?: string;

  isVerified: boolean;
}

const UserModelSchema: Schema<IUser> = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Setting default to the current date/time
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  profilePictureUrl: {
    type: String,
    required: false,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  biography: {
    type: String,
    required: false,
    default: "Hello World!",
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const UserModel = mongoose.model<IUser>("UserModel", UserModelSchema);

export default UserModel;
