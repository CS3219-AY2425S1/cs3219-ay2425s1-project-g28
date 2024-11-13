import { v4 as uuidv4 } from "uuid";
import { bucket, auth } from "../config/firebase";
import { UserRecord } from "firebase-admin/lib/auth/user-record";

export const uploadFileToFirebase = async (
  folderName: string,
  file: Express.Multer.File
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileName = folderName + uuidv4();
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

export const createFirebaseUserWithEmailAndPassword = async (
  uid: string,
  email: string,
  password: string
): Promise<UserRecord> => {
  return auth.createUser({ uid, email, password });
};
