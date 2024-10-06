import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoDBUri: string | undefined =
      process.env.NODE_ENV === "production"
        ? process.env.MONGO_CLOUD_URI
        : process.env.MONGO_LOCAL_URI;

    if (!mongoDBUri) {
      throw new Error("MongoDB URI is not provided");
    }

    await mongoose.connect(mongoDBUri);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
