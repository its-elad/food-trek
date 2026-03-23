import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../app.js";
import PostModel from "../models/post.model.js";
import LikeModel from "../models/like.model.js";
import { extractCookies } from "./utils/extract-cookies.js";

let app: Express;
let mongoMemoryServer: MongoMemoryServer;
let authCookies: string[];
let userId: string;
let postId: string;

beforeAll(async () => {
  mongoMemoryServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoMemoryServer.getUri());
  app = createApp();

  const registerResponse = await request(app).post("/api/auth/register").send({
    username: "UserOne",
    email: "example@gmail.com",
    password: "password123",
  });

  authCookies = extractCookies(registerResponse);
  userId = registerResponse.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoMemoryServer.stop();
});

beforeEach(async () => {
  await PostModel.deleteMany({});
  await LikeModel.deleteMany({});

  const post = await PostModel.create({
    imageUrl: "https://example.com/image.jpg",
    text: "This is my post.",
    userId,
  });
  postId = post._id.toString();
});

describe("Likes Controller", () => {
  describe("POST /api/likes", () => {
    test("successfully adding a like to an existing post", async () => {
      const res = await request(app).post("/api/likes").set("Cookie", authCookies).send({ postId });

      expect(res.statusCode).toBe(201);
      expect(res.body.postId).toBe(postId);
      expect(res.body.userId).toBe(userId);
    });

    test("returns not-found status when trying to add a like to a non-existent post", async () => {
      const fakePostId = new mongoose.Types.ObjectId().toString();

      const res = await request(app).post("/api/likes").set("Cookie", authCookies).send({ postId: fakePostId });

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("post not found");
    });

    test("returns bad-request status when data is missing", async () => {
      const res = await request(app).post("/api/likes").set("Cookie", authCookies).send({});

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe("post-id is required");
    });
  });

  describe("GET /api/likes/logged-in-user/post/:postId", () => {
    test("returns the like document if the logged-in user has liked the post", async () => {
      await LikeModel.create({ postId, userId });

      const res = await request(app).get(`/api/likes/logged-in-user/post/${postId}`).set("Cookie", authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.postId).toBe(postId);
      expect(res.body.userId).toBe(userId);
    });

    test("returns null if the logged-in user has not liked the post", async () => {
      const res = await request(app).get(`/api/likes/logged-in-user/post/${postId}`).set("Cookie", authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeNull();
    });

    test("returns not-found status if the post itself does not exist", async () => {
      const fakePostId = new mongoose.Types.ObjectId().toString();

      const res = await request(app).get(`/api/likes/logged-in-user/post/${fakePostId}`).set("Cookie", authCookies);

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("post not found");
    });
  });

  describe("GET /api/likes/post/:postId/count", () => {
    test("returns correct count of likes for a post", async () => {
      await LikeModel.create([
        { postId, userId: "123456789" },
        { postId, userId: "987654321" },
      ]);

      const res = await request(app).get(`/api/likes/post/${postId}/count`).set("Cookie", authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2);
    });

    test("returns zero for a post with no likes", async () => {
      const res = await request(app).get(`/api/likes/post/${postId}/count`).set("Cookie", authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(0);
    });
  });
});
