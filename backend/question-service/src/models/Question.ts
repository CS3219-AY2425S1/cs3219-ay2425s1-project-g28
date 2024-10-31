import mongoose, { Schema, Document } from "mongoose";

export interface ITestcase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface IQuestion extends Document {
  title: string;
  description: string;
  complexity: string;
  category: string[];
  testcases: ITestcase[];
  testcaseInputFileUrl: string;
  testcaseOutputFileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const testcaseSchema: Schema<ITestcase> = new mongoose.Schema({
  id: { type: String, required: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
});

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
    testcases: { type: [testcaseSchema], required: true },
    testcaseInputFileUrl: { type: String, required: true },
    testcaseOutputFileUrl: { type: String, required: true },
  },
  { timestamps: true },
);

const Question = mongoose.model<IQuestion>("Question", questionSchema);

export default Question;
