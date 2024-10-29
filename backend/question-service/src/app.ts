import express, { Request, Response } from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import yaml from "yaml";
import fs from "fs";
import cors from "cors";

import questionRoutes from "./routes/questionRoutes.ts";

dotenv.config();

const allowedOrigins = process.env.ORIGINS
  ? process.env.ORIGINS.split(",")
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

const file = fs.readFileSync("./swagger.yml", "utf-8");
const swaggerDocument = yaml.parse(file);

const app = express();

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.options("*", cors({ origin: allowedOrigins, credentials: true }));

// To handle CORS Errors
// app.use((req: Request, res: Response, next: NextFunction) => {
//   res.header("Access-Control-Allow-Origin", req.headers.origin); // "*" -> Allow all links to access

//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization",
//   );

//   // Browsers usually send this before PUT or POST Requests
//   if (req.method === "OPTIONS") {
//     res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
//     return res.status(200).json({});
//   }

//   // Continue Route Processing
//   next();
// });

app.use(express.json());
app.use("/api/questions", questionRoutes);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello world from question service" });
});

export default app;
