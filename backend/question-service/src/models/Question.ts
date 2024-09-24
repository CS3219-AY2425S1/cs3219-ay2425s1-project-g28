import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  title: string;
  description: string;
  complexity: string;
  category: string[];
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
    category: {
      type: [String],
      enum: [
        "Strings",
        "Algorithms",
        "Data Structures",
        "Bit Manipulation",
        "Recursion",
        "Databases",
        "Arrays",
        "Brainteaser",
      ],
      required: true,
    },
  },
  { timestamps: true },
);

const Question = mongoose.model<IQuestion>("Question", questionSchema);

export default Question;
