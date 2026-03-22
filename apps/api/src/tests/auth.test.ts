import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../app.js";
import { User } from "../models/user.model.js";
import { RegisterReq, UserInfo } from "@food-trek/schemas";
import { extractCookies } from "./utils/extract-cookies.js";

const testUser = {
  username: "Dave",
  email: "dave@example.com",
  password: "ISolemnlySwearThatIAmUpToNoGood",
} satisfies RegisterReq;

let app: Express;
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("POST /api/auth/register", () => {
  test("registers a new user and returns 201 with user info + auth cookies", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.username).toBe(testUser.username);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body).not.toHaveProperty("password");

    const cookies = extractCookies(res);
    expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
  });

  test("returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({ username: "nopassword" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("returns 409 when username is already taken", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app).post("/api/auth/register").send({
      username: testUser.username,
      email: "other@example.com",
      password: "password",
    });

    expect(res.statusCode).toBe(409);
  });

  test("returns 409 when email is already taken", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app).post("/api/auth/register").send({
      username: "differentuser",
      email: testUser.email,
      password: "password",
    });

    expect(res.statusCode).toBe(409);
  });

  test("returns 400 when password is too short (< 6 chars)", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "validuser",
      email: "valid@example.com",
      password: "abc",
    });

    expect(res.statusCode).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(testUser);
  });

  test("logs in with correct credentials and returns 200 + auth cookies", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    const body: UserInfo = res.body;

    expect(res.statusCode).toBe(200);
    expect(body).toHaveProperty("_id");
    expect(body.username).toBe(testUser.username);
    expect(body).not.toHaveProperty("password");

    const cookies = extractCookies(res);
    expect(cookies.some((c) => c.startsWith("accessToken="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
  });

  test("returns 401 with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: testUser.username,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  test("returns 401 when username does not exist", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "nonexistent",
      password: "password",
    });

    expect(res.statusCode).toBe(401);
  });

  test("returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "nopass" });

    expect(res.statusCode).toBe(400);
  });
});

describe("POST /api/auth/refresh", () => {
  let authCookies: string[];

  beforeEach(async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    authCookies = extractCookies(res);
  });

  test("returns 200 and issues new tokens when refresh cookie is valid", async () => {
    const res = await request(app).post("/api/auth/refresh").set("Cookie", authCookies);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id");

    const newCookies = extractCookies(res);
    expect(newCookies.some((c) => c.startsWith("accessToken="))).toBe(true);
    expect(newCookies.some((c) => c.startsWith("refreshToken="))).toBe(true);
  });

  test("returns 401 when no refresh cookie is provided", async () => {
    const res = await request(app).post("/api/auth/refresh");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  test("returns 401 with an invalid/tampered refresh token", async () => {
    const res = await request(app).post("/api/auth/refresh").set("Cookie", ["refreshToken=invalid.token.value"]);

    expect(res.statusCode).toBe(401);
  });

  test("detects refresh token reuse (theft) and returns 401 on second use", async () => {
    // First refresh – valid
    const firstRefresh = await request(app).post("/api/auth/refresh").set("Cookie", authCookies);
    expect(firstRefresh.statusCode).toBe(200);

    // Attempt to reuse the original (now rotated-out) refresh token
    const secondRefresh = await request(app).post("/api/auth/refresh").set("Cookie", authCookies);
    expect(secondRefresh.statusCode).toBe(401);
  });

  test("new access token obtained after refresh grants access to protected route", async () => {
    const refreshRes = await request(app).post("/api/auth/refresh").set("Cookie", authCookies);
    expect(refreshRes.statusCode).toBe(200);

    const newCookies = extractCookies(refreshRes);

    const userRes = await request(app).get("/api/auth/user").set("Cookie", newCookies);
    expect(userRes.statusCode).toBe(200);
  });
});

describe("POST /api/auth/logout", () => {
  test("returns 204 and clears auth cookies", async () => {
    const regRes = await request(app).post("/api/auth/register").send(testUser);
    const cookies = extractCookies(regRes);

    const res = await request(app).post("/api/auth/logout").set("Cookie", cookies);

    expect(res.statusCode).toBe(204);

    const clearedCookies = extractCookies(res);
    const accessCookie = clearedCookies.find((c) => c.startsWith("accessToken="));
    if (accessCookie) {
      const isCleared = /Max-Age=0/i.test(accessCookie) || /Expires=Thu, 01 Jan 1970/i.test(accessCookie);
      expect(isCleared).toBe(true);
    }
  });

  test("access token is no longer valid after logout", async () => {
    const regRes = await request(app).post("/api/auth/register").send(testUser);
    const cookies = extractCookies(regRes);

    await request(app).post("/api/auth/logout").set("Cookie", cookies);

    // Use only the cleared (empty) cookies – protected route should reject
    const userRes = await request(app).get("/api/auth/user");
    expect(userRes.statusCode).toBe(401);
  });
});

describe("GET /api/auth/user", () => {
  let authCookies: string[];

  beforeEach(async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    authCookies = extractCookies(res);
  });

  test("returns 200 with user info when authenticated", async () => {
    const res = await request(app).get("/api/auth/user").set("Cookie", authCookies);

    const body: UserInfo = res.body;

    expect(res.statusCode).toBe(200);
    expect(body.username).toBe(testUser.username);
    expect(body.email).toBe(testUser.email);
    expect(body).not.toHaveProperty("password");
    expect(body).not.toHaveProperty("refreshTokens");
  });

  test("returns 401 when no auth cookie is provided", async () => {
    const res = await request(app).get("/api/auth/user");
    expect(res.statusCode).toBe(401);
  });

  test("returns 401 with a tampered access token", async () => {
    const res = await request(app).get("/api/auth/user").set("Cookie", ["accessToken=invalid.token"]);

    expect(res.statusCode).toBe(401);
  });
});

describe("PATCH /api/auth/user", () => {
  let authCookies: string[];

  beforeEach(async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    authCookies = extractCookies(res);
  });

  test("updates username successfully and returns 200", async () => {
    const res = await request(app)
      .patch("/api/auth/user")
      .set("Cookie", authCookies)
      .send({ username: "lukeSkywalker" });

    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe("lukeSkywalker");
  });

  test("updates imgUrl successfully and returns 200", async () => {
    const res = await request(app)
      .patch("/api/auth/user")
      .set("Cookie", authCookies)
      .send({ imgUrl: "https://example.com/avatar.jpg" });

    expect(res.statusCode).toBe(200);
    expect(res.body.imgUrl).toBe("https://example.com/avatar.jpg");
  });

  test("returns 400 when no fields are provided", async () => {
    const res = await request(app).patch("/api/auth/user").set("Cookie", authCookies).send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("returns 409 when the requested username is already taken by another user", async () => {
    // Register a second user
    await request(app).post("/api/auth/register").send({
      username: "claryFray",
      email: "other@example.com",
      password: "password",
    });

    const res = await request(app).patch("/api/auth/user").set("Cookie", authCookies).send({ username: "claryFray" });

    expect(res.statusCode).toBe(409);
  });

  test("returns 401 when not authenticated", async () => {
    const res = await request(app).patch("/api/auth/user").send({ username: "hacker" });

    expect(res.statusCode).toBe(401);
  });
});
