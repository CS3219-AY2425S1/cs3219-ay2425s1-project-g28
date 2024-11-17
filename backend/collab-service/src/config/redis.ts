import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URI =
  process.env.NODE_ENV === "test"
    ? process.env.REDIS_URI_TEST
    : process.env.REDIS_URI || "redis://localhost:6380";

const client = createClient({ url: REDIS_URI });

export const connectRedis = async () => {
  await client.connect();
  client.on("error", (err) => console.log(`Error: ${err}`));
};

export default client;
