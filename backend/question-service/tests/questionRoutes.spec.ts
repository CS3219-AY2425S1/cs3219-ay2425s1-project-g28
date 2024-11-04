import { NextFunction, Request, Response } from "express";
import { faker } from "@faker-js/faker";
import supertest from "supertest";
import app from "../src/app";
import Question from "../src/models/Question";
import {
  DUPLICATE_QUESTION_MESSAGE,
  MONGO_OBJ_ID_MALFORMED_MESSAGE,
  PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE,
  PAGE_LIMIT_REQUIRED_MESSAGE,
  QN_DESC_CHAR_LIMIT,
  QN_DESC_EXCEED_CHAR_LIMIT_MESSAGE,
  QN_NOT_FOUND_MESSAGE,
  SERVER_ERROR_MESSAGE,
} from "../src/utils/constants";

const request = supertest(app);

const BASE_URL = "/api/questions";

faker.seed(0);

jest.mock("../src/middlewares/basicAccessControl", () => ({
  verifyAdminToken: jest.fn((res: Request, req: Response, next: NextFunction) =>
    next(),
  ),
}));

describe("Question routes", () => {
  describe("GET /", () => {
    it("Reads existing questions", async () => {
      const qnLimit = 10;
      const res = await request.get(`${BASE_URL}?page=1&qnLimit=${qnLimit}`);
      expect(res.status).toBe(200);
      expect(res.body.questions.length).toBeLessThanOrEqual(qnLimit);
    });

    it("Reads existing questions with title filter", async () => {
      const qnLimit = 10;
      const title = "tree";
      const res = await request.get(
        `${BASE_URL}?page=1&qnLimit=${qnLimit}&title=${title}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.questions.length).toBeLessThanOrEqual(qnLimit);
      for (const qn of res.body.questions) {
        expect(qn.title.toLowerCase()).toContain(title);
      }
    });

    it("Reads existing questions with complexity filter", async () => {
      const qnLimit = 10;
      const complexity = "Easy";
      const res = await request.get(
        `${BASE_URL}?page=1&qnLimit=${qnLimit}&complexities=${complexity}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.questions.length).toBeLessThanOrEqual(qnLimit);
      for (const qn of res.body.questions) {
        expect(qn.complexity).toBe(complexity);
      }
    });

    it("Reads existing questions with category filters", async () => {
      const qnLimit = 10;
      const category = "Algorithms";
      const res = await request.get(
        `${BASE_URL}?page=1&qnLimit=${qnLimit}&categories=${category}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.questions.length).toBeLessThanOrEqual(qnLimit);
      for (const qn of res.body.questions) {
        expect(qn.categories).toContain(category);
      }
    });

    it("Does not read without page", async () => {
      const res = await request.get(`${BASE_URL}?qnLimit=10`);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(PAGE_LIMIT_REQUIRED_MESSAGE);
    });

    it("Does not read without qnLimit", async () => {
      const res = await request.get(`${BASE_URL}?page=1`);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(PAGE_LIMIT_REQUIRED_MESSAGE);
    });

    it("Does not read with negative page", async () => {
      const res = await request.get(`${BASE_URL}?page=-1&qnLimit=10`);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE);
    });

    it("Does not read with negative qnLimit", async () => {
      const res = await request.get(`${BASE_URL}?page=1&qnLimit=-10`);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe(PAGE_LIMIT_INCORRECT_FORMAT_MESSAGE);
    });
  });

  describe("GET /:id", () => {
    it("Reads existing question", async () => {
      const title = faker.lorem.lines(1);
      const complexity = "Easy";
      const categories = ["Algorithms"];
      const description = faker.lorem.lines();
      const testcaseInputFileUrl = faker.internet.url();
      const testcaseOutputFileUrl = faker.internet.url();
      const pythonTemplate = "some python template";
      const javaTemplate = "some java template";
      const cTemplate = "some c template";

      const newQuestion = new Question({
        title,
        complexity,
        category: categories,
        description,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate,
        javaTemplate,
        cTemplate,
      });
      await newQuestion.save();
      const res = await request.get(`${BASE_URL}/${newQuestion.id}`);
      expect(res.status).toBe(200);
      expect(res.body.question.title).toBe(title);
      expect(res.body.question.complexity).toBe(complexity);
      expect(res.body.question.categories).toEqual(categories);
      expect(res.body.question.description).toBe(description);
    });

    it("Does not read non-existing question with invalid object id", async () => {
      const res = await request.get(`${BASE_URL}/blah`);
      expect(res.status).toBe(500);
      expect(res.body.message).toBe(SERVER_ERROR_MESSAGE);
    });

    it("Does not read non-existing question with valid object id", async () => {
      const res = await request.get(`${BASE_URL}/66f77e9f27ab3f794bdae664`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(QN_NOT_FOUND_MESSAGE);
    });
  });

  describe("GET /categories", () => {
    it("Reads existing question categories", async () => {
      const res = await request.get(`${BASE_URL}/categories`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("categories");
    });
  });

  describe("DELETE /:id", () => {
    it("Deletes existing question", async () => {
      const title = faker.lorem.lines(1);
      const complexity = "Easy";
      const categories = ["Algorithms"];
      const description = faker.lorem.lines();
      const testcaseInputFileUrl = faker.internet.url();
      const testcaseOutputFileUrl = faker.internet.url();
      const pythonTemplate = "some python template";
      const javaTemplate = "some java template";
      const cTemplate = "some c template";

      const newQuestion = new Question({
        title,
        complexity,
        category: categories,
        description,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate,
        javaTemplate,
        cTemplate,
      });
      await newQuestion.save();
      const res = await request.delete(`${BASE_URL}/${newQuestion.id}`);
      expect(res.status).toBe(200);
    });

    it("Does not delete non-existing question with invalid object id", async () => {
      const res = await request.delete(`${BASE_URL}/blah`);
      expect(res.status).toBe(500);
      expect(res.body.message).toBe(SERVER_ERROR_MESSAGE);
    });

    it("Does not delete non-existing question with valid object id", async () => {
      const res = await request.delete(`${BASE_URL}/66f77e9f27ab3f794bdae664`);
      expect(res.status).toBe(404);
      expect(res.body.message).toBe(QN_NOT_FOUND_MESSAGE);
    });
  });

  describe("POST /", () => {
    it("Creates new question", async () => {
      const title = faker.lorem.lines(1);
      const complexity = "Easy";
      const categories = ["Algorithms"];
      const description = faker.lorem.lines(5);
      const testcaseInputFileUrl = faker.internet.url();
      const testcaseOutputFileUrl = faker.internet.url();
      const pythonTemplate = "some python template";
      const javaTemplate = "some java template";
      const cTemplate = "some c template";

      const newQuestion = {
        title,
        complexity,
        category: categories,
        description,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate,
        javaTemplate,
        cTemplate,
      };

      const res = await request.post(`${BASE_URL}`).send(newQuestion);

      expect(res.status).toBe(201);
      expect(res.body.question.title).toBe(title);
      expect(res.body.question.complexity).toBe(complexity);
      expect(res.body.question.categories).toEqual(categories);
      expect(res.body.question.description).toBe(description);
    });

    it("Does not create duplicate questions (case-insensitive, upper case)", async () => {
      const title = faker.lorem.lines(1);
      const complexity = "Easy";
      const categories = ["Algorithms"];
      const description = faker.lorem.lines(5);
      const testcaseInputFileUrl = faker.internet.url();
      const testcaseOutputFileUrl = faker.internet.url();
      const pythonTemplate = "some python template";
      const javaTemplate = "some java template";
      const cTemplate = "some c template";

      const newQuestion = new Question({
        title,
        complexity,
        category: categories,
        description,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate,
        javaTemplate,
        cTemplate,
      });

      await newQuestion.save();

      const duplicateTitle = title.toUpperCase();
      const duplicateQuestion = {
        title: duplicateTitle,
        complexity,
        category: categories,
        description,
      };

      const res = await request.post(`${BASE_URL}`).send(duplicateQuestion);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(DUPLICATE_QUESTION_MESSAGE);
    });

    it("Does not create duplicate questions (case-insensitive, lower case)", async () => {
      const title = faker.lorem.lines(1);
      const complexity = "Easy";
      const categories = ["Algorithms"];
      const description = faker.lorem.lines(5);
      const testcaseInputFileUrl = faker.internet.url();
      const testcaseOutputFileUrl = faker.internet.url();
      const pythonTemplate = "some python template";
      const javaTemplate = "some java template";
      const cTemplate = "some c template";

      const newQuestion = new Question({
        title,
        complexity,
        category: categories,
        description,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate,
        javaTemplate,
        cTemplate,
      });

      await newQuestion.save();

      const duplicateTitle = title.toLowerCase();
      const duplicateQuestion = {
        title: duplicateTitle,
        complexity,
        category: categories,
        description,
      };

      const res = await request.post(`${BASE_URL}`).send(duplicateQuestion);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(DUPLICATE_QUESTION_MESSAGE);
    });

    it("Does not create questions that exceed the character limit", async () => {
      const title = faker.lorem.lines(1);
      const complexity = "Easy";
      const categories = ["Algorithms"];
      const description = faker.lorem.words(QN_DESC_CHAR_LIMIT + 5);
      const testcaseInputFileUrl = faker.internet.url();
      const testcaseOutputFileUrl = faker.internet.url();
      const pythonTemplate = "some python template";
      const javaTemplate = "some java template";
      const cTemplate = "some c template";

      const newQuestion = {
        title,
        complexity,
        category: categories,
        description,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate,
        javaTemplate,
        cTemplate,
      };

      const res = await request.post(`${BASE_URL}`).send(newQuestion);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(QN_DESC_EXCEED_CHAR_LIMIT_MESSAGE);
    });
  });

  describe("PUT /:id", () => {
    it("Updates an existing question", async () => {
      const title = faker.lorem.lines(1);
      const complexity = "Easy";
      const categories = ["Algorithms"];
      const description = faker.lorem.lines(5);
      const testcaseInputFileUrl = faker.internet.url();
      const testcaseOutputFileUrl = faker.internet.url();
      const pythonTemplate = "some python template";
      const javaTemplate = "some java template";
      const cTemplate = "some c template";

      const newQuestion = new Question({
        title,
        complexity,
        category: categories,
        description,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate,
        javaTemplate,
        cTemplate,
      });

      await newQuestion.save();

      const updatedTitle = title.toUpperCase();
      const updatedQuestion = {
        title: updatedTitle,
        complexity,
        category: categories,
        description,
      };

      const res = await request
        .put(`${BASE_URL}/${newQuestion.id}`)
        .send(updatedQuestion);

      expect(res.status).toBe(200);
      expect(res.body.question.title).toBe(updatedTitle);
      expect(res.body.question.complexity).toBe(complexity);
      expect(res.body.question.categories).toEqual(categories);
      expect(res.body.question.description).toBe(description);
    });

    it("Does not update non-existing question with invalid object id", async () => {
      const title = faker.lorem.lines(1);
      const complexity = "Easy";
      const categories = ["Algorithms"];
      const description = faker.lorem.lines(5);
      const testcaseInputFileUrl = faker.internet.url();
      const testcaseOutputFileUrl = faker.internet.url();
      const pythonTemplate = "some python template";
      const javaTemplate = "some java template";
      const cTemplate = "some c template";

      const newQuestion = new Question({
        title,
        complexity,
        category: categories,
        description,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate,
        javaTemplate,
        cTemplate,
      });

      await newQuestion.save();

      const updatedCategories = ["Algorithms", "Brainteaser"];
      const updatedQuestion = {
        title,
        complexity,
        category: updatedCategories,
        description,
      };

      const res = await request.put(`${BASE_URL}/blah`).send(updatedQuestion);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(MONGO_OBJ_ID_MALFORMED_MESSAGE);
    });

    it("Does not update non-existing question with valid object id", async () => {
      const title = faker.lorem.lines(1);
      const complexity = "Easy";
      const categories = ["Algorithms"];
      const description = faker.lorem.lines(5);
      const testcaseInputFileUrl = faker.internet.url();
      const testcaseOutputFileUrl = faker.internet.url();
      const pythonTemplate = "some python template";
      const javaTemplate = "some java template";
      const cTemplate = "some c template";

      const newQuestion = new Question({
        title,
        complexity,
        category: categories,
        description,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate,
        javaTemplate,
        cTemplate,
      });

      await newQuestion.save();

      const updatedCategories = ["Algorithms", "Brainteaser"];
      const updatedQuestion = {
        title,
        complexity,
        category: updatedCategories,
        description,
      };

      const res = await request
        .put(`${BASE_URL}/66f77e9f27ab3f794bdae664`)
        .send(updatedQuestion);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(QN_NOT_FOUND_MESSAGE);
    });

    it("Does not update an existing question if it causes a duplicate", async () => {
      const title = faker.lorem.lines(1);
      const complexity = "Easy";
      const categories = ["Algorithms"];
      const description = faker.lorem.lines(5);
      const testcaseInputFileUrl = faker.internet.url();
      const testcaseOutputFileUrl = faker.internet.url();
      const pythonTemplate = "some python template";
      const javaTemplate = "some java template";
      const cTemplate = "some c template";

      const newQuestion = new Question({
        title,
        complexity,
        category: categories,
        description,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate,
        javaTemplate,
        cTemplate,
      });

      await newQuestion.save();

      const otherTitle = faker.lorem.lines(1);
      const otherComplexity = "Medium";
      const otherCategories = ["String", "Data Structures"];
      const otherDescription = faker.lorem.lines(5);
      const otherTestcaseInputFileUrl = faker.internet.url();
      const otherTestcaseOutputFileUrl = faker.internet.url();
      const otherPythonTemplate = "some python template";
      const otherJavaTemplate = "some java template";
      const otherCTemplate = "some c template";

      const otherQuestion = new Question({
        title: otherTitle,
        complexity: otherComplexity,
        category: otherCategories,
        description: otherDescription,
        testcaseInputFileUrl: otherTestcaseInputFileUrl,
        testcaseOutputFileUrl: otherTestcaseOutputFileUrl,
        pythonTemplate: otherPythonTemplate,
        javaTemplate: otherJavaTemplate,
        cTemplate: otherCTemplate,
      });

      await otherQuestion.save();

      const updatedQuestion = {
        title: otherTitle.toLowerCase(),
        complexity,
        category: categories,
        description,
      };

      const res = await request
        .put(`${BASE_URL}/${newQuestion.id}`)
        .send(updatedQuestion);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(DUPLICATE_QUESTION_MESSAGE);
    });

    it("Does not update an existing question if it exceeds the character limit", async () => {
      const title = faker.lorem.lines(1);
      const complexity = "Easy";
      const categories = ["Algorithms"];
      const description = faker.lorem.lines(5);
      const testcaseInputFileUrl = faker.internet.url();
      const testcaseOutputFileUrl = faker.internet.url();
      const pythonTemplate = "some python template";
      const javaTemplate = "some java template";
      const cTemplate = "some c template";

      const newQuestion = new Question({
        title,
        complexity,
        category: categories,
        description,
        testcaseInputFileUrl,
        testcaseOutputFileUrl,
        pythonTemplate,
        javaTemplate,
        cTemplate,
      });

      await newQuestion.save();

      const updatedQuestion = {
        title,
        complexity,
        category: categories,
        description: faker.lorem.words(QN_DESC_CHAR_LIMIT + 5),
      };

      const res = await request
        .put(`${BASE_URL}/${newQuestion.id}`)
        .send(updatedQuestion);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(QN_DESC_EXCEED_CHAR_LIMIT_MESSAGE);
    });
  });
});
