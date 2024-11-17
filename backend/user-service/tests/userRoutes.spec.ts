import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import supertest from "supertest";
import app from "../src/app";
import UserModel from "../src/model/user-model";

const request = supertest(app);

const USER_BASE_URL = "/api/users";

faker.seed(0);

const mockSendMail = jest.fn();

jest.mock("../src/middleware/basic-access-control", () => ({
  verifyAccessToken: jest.fn((req, res, next) => {
    req.user = {
      id: new mongoose.Types.ObjectId().toHexString(),
      username: faker.internet.userName(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      isAdmin: true,
    };
    next();
  }),

  verifyIsAdmin: jest.fn((req, res, next) => {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }
  }),

  verifyIsOwnerOrAdmin: jest.fn((req, res, next) => {
    const userIdFromReqParams = req.params.id;
    const userIdFromToken = req.user.id;

    if (req.user.isAdmin || userIdFromReqParams === userIdFromToken) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }
  }),
}));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => ({
    sendMail: () => mockSendMail(),
  })),
}));

const username = faker.internet.userName();
const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const email = faker.internet.email();
const biography = faker.lorem.sentence();
const password = "strongPassword@123";
const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

const insertUser = async () => {
  const user = await new UserModel({
    username,
    firstName,
    lastName,
    email,
    biography,
    password: hashedPassword,
    isAdmin: false,
  }).save();
  return user;
};

describe("User routes", () => {
  const token: string = "token";

  it("Create a user", async () => {
    const res = await request
      .post(USER_BASE_URL)
      .send({ username, firstName, lastName, email, password });

    expect(res.status).toBe(201);
  });

  it("Create a user with invalid first name", async () => {
    const res = await request
      .post(USER_BASE_URL)
      .send({ username, firstName: "123", lastName, email, password });

    expect(res.status).toBe(400);
  });

  it("Create a user with invalid last name", async () => {
    const res = await request
      .post(USER_BASE_URL)
      .send({ username, firstName, lastName: "123", email, password });

    expect(res.status).toBe(400);
  });

  it("Create a user with very long name", async () => {
    const res = await request.post(USER_BASE_URL).send({
      username,
      firstName: faker.lorem.sentence(300),
      lastName: faker.lorem.sentence(300),
      email,
      password,
    });

    expect(res.status).toBe(400);
  });

  it("Create a user with invalid username length", async () => {
    const res = await request
      .post(USER_BASE_URL)
      .send({ username: "123", firstName, lastName, email, password });

    expect(res.status).toBe(400);
  });

  it("Create a user with invalid username characters", async () => {
    const res = await request.post(USER_BASE_URL).send({
      username: "!!!!!!!!!!!!!",
      firstName,
      lastName,
      email,
      password,
    });

    expect(res.status).toBe(400);
  });

  it("Create a user with invalid password length", async () => {
    const res = await request
      .post(USER_BASE_URL)
      .send({ username, firstName, lastName, email, password: "weakPw" });

    expect(res.status).toBe(400);
  });

  it("Create a user password with no lowercase character", async () => {
    const res = await request
      .post(USER_BASE_URL)
      .send({ username, firstName, lastName, email, password: "WEAKPW@123" });

    expect(res.status).toBe(400);
  });

  it("Create a user password with no uppercase character", async () => {
    const res = await request
      .post(USER_BASE_URL)
      .send({ username, firstName, lastName, email, password: "weakpw@123" });

    expect(res.status).toBe(400);
  });

  it("Create a user password with no digit", async () => {
    const res = await request
      .post(USER_BASE_URL)
      .send({ username, firstName, lastName, email, password: "weakPw@abc" });

    expect(res.status).toBe(400);
  });

  it("Create a user password with no special character", async () => {
    const res = await request
      .post(USER_BASE_URL)
      .send({ username, firstName, lastName, email, password: "weakPw123" });

    expect(res.status).toBe(400);
  });

  it("Create a user with invalid email", async () => {
    const res = await request.post(USER_BASE_URL).send({
      username,
      firstName,
      lastName,
      email: "invalidEmail!",
      password,
    });

    expect(res.status).toBe(400);
  });

  it("Create a user that already exists", async () => {
    await insertUser();

    const res = await request
      .post(USER_BASE_URL)
      .send({ username, firstName, lastName, email, password });
    expect(res.status).toBe(409);
  });

  it("Create a user with missing fields", async () => {
    const res = await request.post(USER_BASE_URL).send({ username });

    expect(res.status).toBe(400);
  });

  it("Catch unknown error when creating a user", async () => {
    const createUserSpy = jest
      .spyOn(UserModel.prototype, "save")
      .mockImplementation(() => {
        throw new Error();
      });

    const res = await request
      .post(USER_BASE_URL)
      .send({ username, firstName, lastName, email, password });

    expect(res.status).toBe(500);

    createUserSpy.mockRestore();
  });

  it("Get a user", async () => {
    const user = await insertUser();

    const res = await request.get(`${USER_BASE_URL}/${user.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe(username);
    expect(res.body.data.firstName).toBe(firstName);
    expect(res.body.data.lastName).toBe(lastName);
  });

  it("Get an invalid user id", async () => {
    const res = await request.get(`${USER_BASE_URL}/blahblah`);

    expect(res.status).toBe(404);
  });

  it("Get a user not present in the database", async () => {
    const res = await request.get(
      `${USER_BASE_URL}/${new mongoose.Types.ObjectId().toHexString()}`
    );

    expect(res.status).toBe(404);
  });

  it("Catch unknown error when getting a user", async () => {
    const findByIdSpy = jest
      .spyOn(UserModel, "findById")
      .mockImplementation(() => {
        throw new Error();
      });

    const user = await insertUser();

    const res = await request.get(`${USER_BASE_URL}/${user.id}`);

    expect(res.status).toBe(500);

    findByIdSpy.mockRestore();
  });

  it("Get all users", async () => {
    await insertUser();

    const res = await request
      .get(USER_BASE_URL)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it("Catch unknown error when getting all users", async () => {
    const findAllUsersSpy = jest
      .spyOn(UserModel, "find")
      .mockImplementation(() => {
        throw new Error();
      });

    const res = await request
      .get(USER_BASE_URL)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);

    findAllUsersSpy.mockRestore();
  });

  it("Update a user", async () => {
    const user = await insertUser();

    const newFirstName = faker.person.firstName();
    const newLastName = faker.person.lastName();

    await request
      .patch(`${USER_BASE_URL}/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: newFirstName,
        lastName: newLastName,
        biography: faker.lorem.sentence(),
      });

    const updatedUser = await UserModel.findById(user.id);

    expect(updatedUser).not.toBeNull();
    expect(updatedUser!.firstName).toBe(newFirstName);
    expect(updatedUser!.lastName).toBe(newLastName);
  });

  it("Update an invalid user", async () => {
    const res = await request
      .patch(`${USER_BASE_URL}/blahblah`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: faker.person.firstName(),
      });

    expect(res.status).toBe(404);
  });

  it("Update a user not present in the database", async () => {
    const res = await request
      .patch(`${USER_BASE_URL}/${new mongoose.Types.ObjectId().toHexString()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: faker.person.firstName(),
      });

    expect(res.status).toBe(404);
  });

  it("Update a user with invalid old password", async () => {
    const user = await insertUser();

    const res = await request
      .patch(`${USER_BASE_URL}/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: "blahblah",
        newPassword: "strongPassword@1234",
      });

    expect(res.status).toBe(403);
  });

  it("Update a user with invalid new password", async () => {
    const user = await insertUser();

    const res = await request
      .patch(`${USER_BASE_URL}/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: password,
        newPassword: "weakPw",
      });

    expect(res.status).toBe(400);
  });

  it("Update a user with invalid first name", async () => {
    const user = await insertUser();

    const res = await request
      .patch(`${USER_BASE_URL}/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "123",
      });

    expect(res.status).toBe(400);
  });

  it("Update a user with invalid last name", async () => {
    const user = await insertUser();

    const res = await request
      .patch(`${USER_BASE_URL}/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        lastName: "123",
      });

    expect(res.status).toBe(400);
  });

  it("Update a user with invalid biography", async () => {
    const user = await insertUser();

    const res = await request
      .patch(`${USER_BASE_URL}/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        biography: faker.lorem.sentence(300),
      });

    expect(res.status).toBe(400);
  });

  it("Update a user without updating any fields", async () => {
    const user = await insertUser();

    const res = await request
      .patch(`${USER_BASE_URL}/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("Catch unknown error when updating a user", async () => {
    const findByIdAndDeleteSpy = jest
      .spyOn(UserModel, "findByIdAndUpdate")
      .mockImplementation(() => {
        throw new Error();
      });

    const user = await insertUser();

    const res = await request
      .patch(`${USER_BASE_URL}/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: faker.person.firstName(),
      });

    expect(res.status).toBe(500);

    findByIdAndDeleteSpy.mockRestore();
  });

  it("Update a user's privilege", async () => {
    const user = await insertUser();

    const res = await request
      .patch(`${USER_BASE_URL}/${user.id}/privilege`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        isAdmin: true,
      });

    expect(res.status).toBe(200);

    const updatedUser = await UserModel.findById(user.id);

    expect(updatedUser).not.toBeNull();
    expect(updatedUser!.isAdmin).toBe(true);
  });

  it("Update an invalid user id privilege", async () => {
    const res = await request
      .patch(`${USER_BASE_URL}/blahblah/privilege`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        isAdmin: true,
      });

    expect(res.status).toBe(404);
  });

  it("Update a user's privilege whose user id is not in the database", async () => {
    const res = await request
      .patch(
        `${USER_BASE_URL}/${new mongoose.Types.ObjectId().toHexString()}/privilege`
      )
      .set("Authorization", `Bearer ${token}`)
      .send({
        isAdmin: true,
      });

    expect(res.status).toBe(404);
  });

  it("Update a user's privilege without isAdmin field", async () => {
    const user = await insertUser();

    const res = await request
      .patch(`${USER_BASE_URL}/${user.id}/privilege`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("Catch unknown error when updating a user's privilege", async () => {
    const findByIdAndUpdateSpy = jest
      .spyOn(UserModel, "findByIdAndUpdate")
      .mockImplementation(() => {
        throw new Error();
      });

    const user = await insertUser();

    const res = await request
      .patch(`${USER_BASE_URL}/${user.id}/privilege`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        isAdmin: true,
      });

    expect(res.status).toBe(500);

    findByIdAndUpdateSpy.mockRestore();
  });

  it("Delete a user", async () => {
    const user = await insertUser();

    const res = await request
      .delete(`${USER_BASE_URL}/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const deletedUser = await UserModel.findById(user.id);

    expect(deletedUser).toBeNull();
  });

  it("Delete an invalid user id", async () => {
    const res = await request
      .delete(`${USER_BASE_URL}/blahblah`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("Delete a user not present in the database", async () => {
    const res = await request
      .delete(`${USER_BASE_URL}/${new mongoose.Types.ObjectId().toHexString()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it("Catch unknown error when deleting a user", async () => {
    const findByIdAndDeleteSpy = jest
      .spyOn(UserModel, "findByIdAndDelete")
      .mockImplementation(() => {
        throw new Error();
      });

    const user = await insertUser();

    const res = await request
      .delete(`${USER_BASE_URL}/${user.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);

    findByIdAndDeleteSpy.mockRestore();
  });
});
