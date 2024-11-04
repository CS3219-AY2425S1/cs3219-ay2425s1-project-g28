import app from "./app.ts";
import connectDB from "./config/db.ts";

const PORT = process.env.SERVICE_PORT || 3006;

if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      console.log("MongoDB Connected!");

      app.listen(PORT, () => {
        console.log(
          `Question history service server listening on http://localhost:${PORT}`
        );
      });
    })
    .catch((err) => {
      console.error("Failed to connect to DB");
      console.error(err);
    });
}
