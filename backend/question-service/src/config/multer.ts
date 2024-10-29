import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage }).array("images[]");

export { upload };
