import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  description: string;
  complexity: string;
  category: string[];
  testcaseInputFileUrl: string;
  testcaseOutputFileUrl: string;
  pythonTemplate: string;
  javaTemplate: string;
  cTemplate: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema: Schema<IQuestion> = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    complexity: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    category: { type: [String], required: true },
    testcaseInputFileUrl: { type: String, required: true },
    testcaseOutputFileUrl: { type: String, required: true },
    pythonTemplate: { type: String, default: "" },
    javaTemplate: { type: String, default: "" },
    cTemplate: { type: String, default: "" },
  },
  { timestamps: true },
);

const Question = mongoose.model<IQuestion>("Question", questionSchema);

export default Question;
