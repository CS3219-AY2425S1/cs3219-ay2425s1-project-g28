import app from "./app.ts";
import connectDB from "./config/db.ts";

const PORT = process.env.SERVICE_PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      console.log("MongoDB Connected!");

      app.listen(PORT, () => {
        console.log(
          `Question service server listening on http://localhost:${PORT}`,
        );
      });
    })
    .catch((err) => {
      console.error("Failed to connect to DB");
      console.error(err);
    });
}
