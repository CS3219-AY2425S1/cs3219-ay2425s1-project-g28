import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URI = process.env.REDIS_URI || "redis://localhost:6379";

const client = createClient({ url: REDIS_URI });

export const connectRedis = async () => {
  await client.connect();
  client.on("error", (err) => console.log(`Error: ${err}`));
};

// client.on("error", (err) => console.log(`Error: ${err}`));

// (async () => await client.connect())();

export default client;
