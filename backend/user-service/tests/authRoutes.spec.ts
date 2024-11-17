import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import supertest from "supertest";
import app from "../src/app";
import UserModel from "../src/model/user-model";

jest.setTimeout(10000);

const request = supertest(app);

const AUTH_BASE_URL = "/api/auth";

faker.seed(0);

const username = faker.internet.userName();
const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const email = faker.internet.email();
const password = "strongPassword@123";
const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

const insertAdminUser = async () => {
  await new UserModel({
    username,
    firstName,
    lastName,
    email,
    password: hashedPassword,
    isAdmin: true,
    isVerified: true,
  }).save();

  return { email, password };
};

const insertNonAdminUser = async () => {
  await new UserModel({
    username,
    firstName,
    lastName,
    email,
    password: hashedPassword,
    isVerified: true,
  }).save();

  return { email, password };
};

describe("Auth routes", () => {
  it("Login", async () => {
    const credentials = await insertNonAdminUser();

    const res = await request.post(`${AUTH_BASE_URL}/login`).send(credentials);

    expect(res.status).toBe(200);
  });

  it("Login with invalid password", async () => {
    const { email } = await insertNonAdminUser();

    const res = await request
      .post(`${AUTH_BASE_URL}/login`)
      .send({ email, password: "blahblah" });

    expect(res.status).toBe(401);
  });

  it("Login with invalid email", async () => {
    const { password } = await insertNonAdminUser();

    const res = await request
      .post(`${AUTH_BASE_URL}/login`)
      .send({ email: "blahblah", password });

    expect(res.status).toBe(401);
  });

  it("Login with missing email and/or password", async () => {
    const res = await request.post(`${AUTH_BASE_URL}/login`).send({});

    expect(res.status).toBe(400);
  });

  it("Catch server error when login", async () => {
    const loginSpy = jest.spyOn(UserModel, "findOne").mockImplementation(() => {
      throw new Error();
    });

    const res = await request
      .post(`${AUTH_BASE_URL}/login`)
      .send({ email, password });

    expect(res.status).toBe(500);

    loginSpy.mockRestore();
  });

  it("Verify token with missing token", async () => {
    const res = await request.get(`${AUTH_BASE_URL}/verify-token`);

    expect(res.status).toBe(401);
  });

  it("Verify token", async () => {
    const { email, password } = await insertNonAdminUser();

    const loginRes = await request
      .post(`${AUTH_BASE_URL}/login`)
      .send({ email, password });

    const token = loginRes.body.data.accessToken;

    const res = await request
      .get(`${AUTH_BASE_URL}/verify-token`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.isAdmin).toBe(false);
  });

  it("Verify invalid token", async () => {
    const res = await request
      .get(`${AUTH_BASE_URL}/verify-token`)
      .set("Authorization", `Bearer blahblah`);

    expect(res.status).toBe(401);
  });

  it("Verify admin token", async () => {
    const { email, password } = await insertAdminUser();

    const loginRes = await request
      .post(`${AUTH_BASE_URL}/login`)
      .send({ email, password });

    const token = loginRes.body.data.accessToken;

    const res = await request
      .get(`${AUTH_BASE_URL}/verify-admin-token`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.isAdmin).toBe(true);
  });

  it("Verify admin token with non-admin user", async () => {
    const { email, password } = await insertNonAdminUser();

    const loginRes = await request
      .post(`${AUTH_BASE_URL}/login`)
      .send({ email, password });

    const token = loginRes.body.data.accessToken;

    const res = await request
      .get(`${AUTH_BASE_URL}/verify-admin-token`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
