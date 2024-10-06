import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("profilePic");

export { upload };
