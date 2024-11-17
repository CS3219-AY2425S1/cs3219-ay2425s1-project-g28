import mongoose from "mongoose";

beforeAll(async () => {
  const mongoUri =
    process.env.MONGO_URI_TEST || "mongodb://mongo:mongo@test-mongo:27017/";

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri, {});
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
});
