import express, { Request, Response } from "express";
import dotenv from "dotenv";
import fs from "fs";
import yaml from "yaml";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

import collabRoutes from "./src/routes/collabRoutes.ts";

dotenv.config();

export const allowedOrigins = process.env.ORIGINS
  ? process.env.ORIGINS.split(",")
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

const file = fs.readFileSync("./swagger.yml", "utf-8");
const swaggerDocument = yaml.parse(file);

const app = express();

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.options("*", cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());

app.use("/api/collab", collabRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello world from collab service" });
});

export default app;
