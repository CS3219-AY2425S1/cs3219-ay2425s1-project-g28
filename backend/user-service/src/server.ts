import http from "http";
import index from "./app";
import dotenv from "dotenv";
import { connectToDB } from "./model/repository";
import { seedAdminAccount } from "./scripts/seed";
import { connectRedis } from "./config/redis";

dotenv.config();

const port = process.env.SERVICE_PORT || 3001;

const server = http.createServer(index);

if (process.env.NODE_ENV !== "test") {
  await connectToDB()
    .then(() => {
      console.log("MongoDB Connected!");
      seedAdminAccount();

      server.listen(port);
      console.log("User service server listening on http://localhost:" + port);
    })
    .catch((err) => {
      console.error("Failed to connect to DB");
      console.error(err);
    });

  await connectRedis();
}
