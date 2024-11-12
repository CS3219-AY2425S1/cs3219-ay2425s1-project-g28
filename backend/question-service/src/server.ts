import app from "./app.ts";
import connectDB from "./config/db.ts";
// import { seedQuestions } from "./scripts/seed.ts";

const PORT = process.env.SERVICE_PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      console.log("MongoDB Connected!");
      // seedQuestions();

      const server = app.listen(PORT, () => {
        console.log(
          `Question service server listening on http://localhost:${PORT}`,
        );
      });

      server.keepAliveTimeout = 70 * 1000; // set timeout value to > load balancer idle timeout (60s)
    })
    .catch((err) => {
      console.error("Failed to connect to DB");
      console.error(err);
    });
}
