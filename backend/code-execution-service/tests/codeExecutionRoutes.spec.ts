import supertest from "supertest";
import app from "../app";
import {
  ERROR_MISSING_REQUIRED_FIELDS_MESSAGE,
  ERROR_UNSUPPORTED_LANGUAGE_MESSAGE,
  ERROR_NOT_SAME_LENGTH_MESSAGE,
  SUCCESS_MESSAGE,
} from "../src/utils/constants";

const request = supertest(app);

const BASE_URL = "/api";

describe("Code execution routes", () => {
  describe("GET /", () => {
    it("should return 200 OK", (done) => {
      request.get("/").expect(200, done);
    });
  });

  describe("POST /api/run", () => {
    it("should return 400 if required fields are missing", async () => {
      const response = await request
        .post(`${BASE_URL}/run`)
        .send({ language: "python" });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_MISSING_REQUIRED_FIELDS_MESSAGE);
    });

    it("should return 400 if the language is unsupported", async () => {
      const response = await request.post(`${BASE_URL}/run`).send({
        language: "testing1234",
        code: "print('Hello, world!')",
        stdinList: ["input"],
        stdoutList: ["Hello, world!"],
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_UNSUPPORTED_LANGUAGE_MESSAGE);
    });

    it("should return 400 if stdinList and stdoutList lengths do not match", async () => {
      const response = await request.post(`${BASE_URL}/run`).send({
        language: "python",
        code: "print('Hello, world!')",
        stdinList: ["input1"],
        stdoutList: ["output1", "output2"],
      });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(ERROR_NOT_SAME_LENGTH_MESSAGE);
    });

    it("should return 200 and execution result when code executes successfully", async () => {
      const response = await request.post(`${BASE_URL}/run`).send({
        language: "python",
        code: "print(input())",
        stdinList: ["Hello, world!"],
        stdoutList: ["Hello, world!"],
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(SUCCESS_MESSAGE);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0]).toHaveProperty("isMatch", true);
    });
  });
});
