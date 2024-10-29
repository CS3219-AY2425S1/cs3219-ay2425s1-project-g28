import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { bucket } from "../config/firebase";

import Question from "../models/Question";

export const checkIsExistingQuestion = async (
  title: string,
  idToExcludeFromCheck = "",
) => {
  const objectIdToExclude = idToExcludeFromCheck
    ? new mongoose.Types.ObjectId(idToExcludeFromCheck)
    : null;

  return await Question.findOne({
    title: new RegExp(`^${title}$`, "i"),
    _id: { $ne: objectIdToExclude }, // Exclude current question's ID if provided
  });
};

export const uploadFileToFirebase = async (
  file: Express.Multer.File,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileName = uuidv4();
    const ref = bucket.file(fileName);

    const blobStream = ref.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on("error", (error) => {
      reject(error);
    });

    blobStream.on("finish", async () => {
      try {
        await ref.makePublic();
        resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
      } catch (error) {
        reject(error);
      }
    });

    blobStream.end(file.buffer);
  });
};

export const sortAlphabetically = (arr: string[]) => {
  return [...arr].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
};
