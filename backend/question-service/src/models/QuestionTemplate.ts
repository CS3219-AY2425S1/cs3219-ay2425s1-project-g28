import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuestionTemplate extends Document {
  questionId: Types.ObjectId;
  pythonTemplate: string;
  javaTemplate: string;
  cTemplate: string;
}

const questionTemplateSchema: Schema<IQuestionTemplate> = new mongoose.Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    pythonTemplate: { type: String, default: "" },
    javaTemplate: { type: String, default: "" },
    cTemplate: { type: String, default: "" },
  },
  { timestamps: true },
);

const Question = mongoose.model<IQuestionTemplate>(
  "QuestionTemplate",
  questionTemplateSchema,
);

export default Question;
