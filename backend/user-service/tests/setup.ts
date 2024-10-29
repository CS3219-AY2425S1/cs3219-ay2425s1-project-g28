import mongoose from "mongoose";
import redisClient from "../src/config/redis";

beforeAll(async () => {
  const mongoUri =
    process.env.MONGO_URI_TEST || "mongodb://mongo:mongo@test-mongo:27017/";

  await mongoose.connect(mongoUri, {});
  await redisClient.connect();
  redisClient.on("error", (err) => console.log(`Error: ${err}`));
});

afterEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  if (collections) {
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await redisClient.disconnect();
});
