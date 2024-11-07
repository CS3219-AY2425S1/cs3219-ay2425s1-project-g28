import { faker } from "@faker-js/faker";
import supertest from "supertest";
import app from "../src/app";
import {
  MONGO_OBJ_ID_MALFORMED_MESSAGE,
  ORDER_INCORRECT_FORMAT_MESSAGE,
  PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE,
  PAGE_LIMIT_USERID_ORDER_REQUIRED_MESSAGE,
  QN_HIST_NOT_FOUND_MESSAGE,
} from "../src/utils/constants";
import QnHistory from "../src/models/QnHistory";

const request = supertest(app);

const BASE_URL = "/api/qnhistories";

faker.seed(0);

describe("Qn History Routes", () => {
  describe("POST / ", () => {
    it("Creates new qn history", async () => {
      const userIds = ["66f77e9f27ab3f794bdae664", "66f77e9f27ab3f794bdae665"];
      const questionId = "66f77e9f27ab3f794bdae666";
      const title = faker.lorem.lines(1);
      const submissionStatus = "Attempted";
      const dateAttempted = new Date();
      const timeTaken = 0;
      const code = "hi";
      const language = "Python";
      const newQnHistory = {
        userIds,
        questionId,
        title,
        submissionStatus,
        dateAttempted,
        timeTaken,
        code,
        language,
      };

      const res = await request.post(`${BASE_URL}`).send(newQnHistory);

      expect(res.status).toBe(201);
      expect(res.body.qnHistory.userIds).toEqual(userIds);
      expect(res.body.qnHistory.questionId).toBe(questionId);
      expect(res.body.qnHistory.title).toBe(title);
      expect(res.body.qnHistory.submissionStatus).toBe(submissionStatus);
      expect(res.body.qnHistory.dateAttempted).toBe(
        dateAttempted.toISOString()
      );
      expect(res.body.qnHistory.timeTaken).toBe(timeTaken);
      expect(res.body.qnHistory.code).toBe(code);
      expect(res.body.qnHistory.language).toBe(language);
    });
  });

  describe("GET /", () => {
    it("Reads existing question histories", async () => {
      const qnHistLimit = 10;
      const res = await request.get(
        `${BASE_URL}?page=1&qnHistLimit=${qnHistLimit}&userId=66f77e9f27ab3f794bdae664&order=1`
      );
      expect(res.status).toBe(200);
      expect(res.body.qnHistories.length).toBeLessThanOrEqual(qnHistLimit);
    });

    it("Does not read without page", async () => {
      const res = await request.get(
        `${BASE_URL}?qnHistLimit=10&userId=66f77e9f27ab3f794bdae664&order=1`
      );
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(PAGE_LIMIT_USERID_ORDER_REQUIRED_MESSAGE);
    });

    it("Does not read without qnHistLimit", async () => {
      const res = await request.get(
        `${BASE_URL}?page=1&userId=66f77e9f27ab3f794bdae664&order=1`
      );
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(PAGE_LIMIT_USERID_ORDER_REQUIRED_MESSAGE);
    });

    it("Does not read without userId", async () => {
      const res = await request.get(
        `${BASE_URL}?page=1&qnHistLimit=10&order=1`
      );
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(PAGE_LIMIT_USERID_ORDER_REQUIRED_MESSAGE);
    });

    it("Does not read without order", async () => {
      const res = await request.get(
        `${BASE_URL}?page=1&qnHistLimit=10&userId=66f77e9f27ab3f794bdae664`
      );
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(PAGE_LIMIT_USERID_ORDER_REQUIRED_MESSAGE);
    });

    it("Does not read with negative page", async () => {
      const res = await request.get(
        `${BASE_URL}?page=-1&qnHistLimit=10&userId=66f77e9f27ab3f794bdae664&order=1`
      );
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE);
    });

    it("Does not read with negative qnHistLimit", async () => {
      const res = await request.get(
        `${BASE_URL}?page=1&qnHistLimit=-10&userId=66f77e9f27ab3f794bdae664&order=1`
      );
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE);
    });

    it("Does not read with invalid userId format", async () => {
      const res = await request.get(
        `${BASE_URL}?page=1&qnHistLimit=10&userId=6&order=1`
      );
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MONGO_OBJ_ID_MALFORMED_MESSAGE);
    });

    it("Does not read with invalid order", async () => {
      const res = await request.get(
        `${BASE_URL}?page=1&qnHistLimit=10&userId=66f77e9f27ab3f794bdae664&order=2`
      );
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(ORDER_INCORRECT_FORMAT_MESSAGE);
    });
  });

  describe("GET /:id", () => {
    it("Reads existing qn history", async () => {
      const userIds = ["66f77e9f27ab3f794bdae664", "66f77e9f27ab3f794bdae665"];
      const questionId = "66f77e9f27ab3f794bdae666";
      const title = faker.lorem.lines(1);
      const submissionStatus = "Attempted";
      const dateAttempted = new Date();
      const timeTaken = 0;
      const language = "Python";
      const newQnHistory = new QnHistory({
        userIds,
        questionId,
        title,
        submissionStatus,
        dateAttempted,
        timeTaken,
        language,
      });
      await newQnHistory.save();
      const res = await request.get(`${BASE_URL}/${newQnHistory.id}`);
      expect(res.status).toBe(200);
      expect(res.body.qnHistory.userIds).toEqual(userIds);
      expect(res.body.qnHistory.questionId).toBe(questionId);
      expect(res.body.qnHistory.title).toBe(title);
      expect(res.body.qnHistory.submissionStatus).toBe(submissionStatus);
      expect(res.body.qnHistory.dateAttempted).toBe(
        dateAttempted.toISOString()
      );
      expect(res.body.qnHistory.timeTaken).toBe(timeTaken);
      expect(res.body.qnHistory.language).toBe(language);
    });

    it("Does not read non-existing qn history with invalid object id", async () => {
      const res = await request.get(`${BASE_URL}/blah`);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MONGO_OBJ_ID_MALFORMED_MESSAGE);
    });

    it("Does not read non-existing qn history with valid object id", async () => {
      const res = await request.get(`${BASE_URL}/66f77e9f27ab3f794bdae664`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(QN_HIST_NOT_FOUND_MESSAGE);
    });
  });

  describe("PUT /:id", () => {
    it("Updates an existing qn history", async () => {
      const userIds = ["66f77e9f27ab3f794bdae664", "66f77e9f27ab3f794bdae665"];
      const questionId = "66f77e9f27ab3f794bdae666";
      const title = faker.lorem.lines(1);
      const submissionStatus = "Attempted";
      const dateAttempted = new Date();
      const timeTaken = 0;
      const language = "Python";
      const newQnHistory = new QnHistory({
        userIds,
        questionId,
        title,
        submissionStatus,
        dateAttempted,
        timeTaken,
        language,
      });
      await newQnHistory.save();

      const updatedTitle = title.toUpperCase();
      const updatedQnHistory = {
        userIds,
        questionId,
        title: updatedTitle,
        submissionStatus,
        dateAttempted,
        timeTaken,
        language,
      };

      const res = await request
        .put(`${BASE_URL}/${newQnHistory.id}`)
        .send(updatedQnHistory);

      expect(res.status).toBe(200);
      expect(res.body.qnHistory.userIds).toEqual(userIds);
      expect(res.body.qnHistory.questionId).toBe(questionId);
      expect(res.body.qnHistory.title).toBe(updatedTitle);
      expect(res.body.qnHistory.submissionStatus).toBe(submissionStatus);
      expect(res.body.qnHistory.dateAttempted).toBe(
        dateAttempted.toISOString()
      );
      expect(res.body.qnHistory.timeTaken).toBe(timeTaken);
      expect(res.body.qnHistory.language).toBe(language);
    });

    it("Does not update non-existing qn history with invalid object id", async () => {
      const updatedQnHistory = {
        title: "updatedTitle",
      };
      const res = await request.put(`${BASE_URL}/blah`).send(updatedQnHistory);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MONGO_OBJ_ID_MALFORMED_MESSAGE);
    });

    it("Does not update non-existing qn history with valid object id", async () => {
      const updatedQnHistory = {
        title: "updatedTitle",
      };
      const res = await request
        .put(`${BASE_URL}/66f77e9f27ab3f794bdae664`)
        .send(updatedQnHistory);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(QN_HIST_NOT_FOUND_MESSAGE);
    });
  });

  describe("DELETE /:id", () => {
    it("Deletes existing qn history", async () => {
      const userIds = ["66f77e9f27ab3f794bdae664", "66f77e9f27ab3f794bdae665"];
      const questionId = "66f77e9f27ab3f794bdae666";
      const title = faker.lorem.lines(1);
      const submissionStatus = "Attempted";
      const dateAttempted = new Date();
      const timeTaken = 0;
      const language = "Python";
      const newQnHistory = new QnHistory({
        userIds,
        questionId,
        title,
        submissionStatus,
        dateAttempted,
        timeTaken,
        language,
      });
      await newQnHistory.save();
      const res = await request.delete(`${BASE_URL}/${newQnHistory.id}`);
      expect(res.status).toBe(200);
    });

    it("Does not delete non-existing qn history with invalid object id", async () => {
      const res = await request.delete(`${BASE_URL}/blah`);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MONGO_OBJ_ID_MALFORMED_MESSAGE);
    });

    it("Does not delete non-existing qn history with valid object id", async () => {
      const res = await request.delete(`${BASE_URL}/66f77e9f27ab3f794bdae664`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(QN_HIST_NOT_FOUND_MESSAGE);
    });
  });
});
