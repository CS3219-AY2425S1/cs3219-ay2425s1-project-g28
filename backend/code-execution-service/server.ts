import app from "./app";

const PORT = process.env.SERVICE_PORT || 3003;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(
      `Code Execution service server listening on http://localhost:${PORT}`
    );
  });
}
