import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage }).array("images[]");
const uploadTestcaseFiles = multer({ storage }).fields([
  { name: "testcaseInputFile", maxCount: 1 },
  { name: "testcaseOutputFile", maxCount: 1 },
]);

export { upload, uploadTestcaseFiles };
