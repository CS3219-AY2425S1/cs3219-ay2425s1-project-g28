import { v4 as uuidv4 } from "uuid";
import { bucket } from "../config/firebase";

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

/*export const deleteFileFromFirebase = async (
    fileUrl: string
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const fileName = fileUrl.split('/o/')[1].split('?')[0].replace(/%2F/g, '/');
        const ref = bucket.file(fileName);
    
        async () => {
          try {
            await ref.delete();
            resolve("File deleted");
          } catch (error) {
            reject(error);
          }
        }
    })
};*/
