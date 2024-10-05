import UserModel, { IUser } from "./user-model";
import "dotenv/config";
import { connect } from "mongoose";

export async function connectToDB() {
  let mongoDBUri: string | undefined =
    process.env.NODE_ENV === "production"
      ? process.env.MONGO_CLOUD_URI
      : process.env.MONGO_LOCAL_URI;

  if (!mongoDBUri) {
    throw new Error("MongoDB URI is not provided");
  }

  await connect(mongoDBUri);
}

export async function createUser(
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
  isAdmin: boolean = false
): Promise<IUser> {
  return new UserModel({
    firstName,
    lastName,
    username,
    email,
    password,
    isAdmin,
  }).save();
}

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return UserModel.findOne({ email });
}

export async function findUserById(userId: string): Promise<IUser | null> {
  return UserModel.findById(userId);
}

export async function findUserByUsername(
  username: string
): Promise<IUser | null> {
  return UserModel.findOne({ username });
}

export async function findUserByUsernameOrEmail(
  username: string,
  email: string
): Promise<IUser | null> {
  return UserModel.findOne({
    $or: [{ username }, { email }],
  });
}

export async function findAllUsers(): Promise<IUser[]> {
  return UserModel.find();
}

export async function updateUserById(
  userId: string,
  password: string | undefined,
  profilePictureUrl: string,
  firstName: string,
  lastName: string,
  biography: string
): Promise<IUser | null> {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        password,
        profilePictureUrl,
        firstName,
        lastName,
        biography,
      },
    },
    { new: true } // return the updated user
  );
}

export async function updateUserPrivilegeById(
  userId: string,
  isAdmin: boolean
): Promise<IUser | null> {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin,
      },
    },
    { new: true } // return the updated user
  );
}

export async function deleteUserById(userId: string): Promise<IUser | null> {
  return UserModel.findByIdAndDelete(userId);
}
