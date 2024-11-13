import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import yaml from "yaml";
import swaggerUi from "swagger-ui-express";

import userRoutes from "./routes/user-routes";
import authRoutes from "./routes/auth-routes";

dotenv.config();

const file = fs.readFileSync("./swagger.yml", "utf-8");
const swaggerDocument = yaml.parse(file);
const allowedOrigins = process.env.ORIGINS
  ? process.env.ORIGINS.split(",")
  : ["http://localhost:5173", "http://127.0.0.1:5173"];
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: allowedOrigins, credentials: true })); // config cors so that front-end can use
app.options("*", cors({ origin: allowedOrigins, credentials: true }));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req: Request, res: Response, _next: NextFunction) => {
  console.log("Sending Greetings!");
  res.json({
    message: "Hello World from user-service",
  });
});

export default app;
