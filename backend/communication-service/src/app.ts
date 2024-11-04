import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

export const allowedOrigins = process.env.ORIGINS
  ? process.env.ORIGINS.split(",")
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.options("*", cors({ origin: allowedOrigins, credentials: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello world from communication service" });
});

export default app;
