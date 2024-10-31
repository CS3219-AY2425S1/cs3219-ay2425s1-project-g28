import mongoose, { Schema, Document } from "mongoose";

export interface IQnHistory extends Document {
  userIds: string[];
  questionId: string;
  title: string;
  submissionStatus: string;
  dateAttempted: Date;
  timeTaken: Number;
  code: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const qnHistorySchema: Schema<IQnHistory> = new mongoose.Schema(
  {
    userIds: { type: [String], required: true },
    questionId: { type: String, required: true },
    title: { type: String, required: true },
    submissionStatus: {
      type: String,
      enum: ["Accepted", "Rejected", "Attempted"],
      required: true,
    },
    dateAttempted: { type: Date, required: true },
    timeTaken: { type: Number, required: true },
    code: { type: String, required: false, default: "" },
    language: {
      type: String,
      enum: ["Python", "Java", "C"],
      required: true,
    },
  },
  { timestamps: true }
);

const QnHistory = mongoose.model<IQnHistory>("QnHistory", qnHistorySchema);

export default QnHistory;
