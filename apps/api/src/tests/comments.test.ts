import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../app.js";
import PostModel from "../models/post.model.js";
import CommentModel from "../models/comment.model.js";
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
    email: "example@gamil.com",
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
  await CommentModel.deleteMany({});

  const post = await PostModel.create({
    imageUrl: "https://example.com/image.jpg",
    text: "This is my post.",
    userId: "123456789",
  });
  postId = post._id.toString();
});

describe("Comments Controller", () => {
  describe("POST /api/comments", () => {
    test("successfully adding a comment to an existing post", async () => {
      const commentData = { postId, text: "This is my comment." };

      const res = await request(app).post("/api/comments").set("Cookie", authCookies).send(commentData);

      expect(res.statusCode).toBe(201);
      expect(res.body.text).toBe(commentData.text);
      expect(res.body.postId).toBe(postId);
      expect(res.body.userId).toBe(userId);
    });

    test("returns not-found status when trying to comment on a non-existent post", async () => {
      const fakePostId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .post("/api/comments")
        .set("Cookie", authCookies)
        .send({ postId: fakePostId, text: "This is my post." });

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("post not found");
    });

    test("returns bad-request status when data is missing", async () => {
      const res = await request(app).post("/api/comments").set("Cookie", authCookies).send({ postId });

      expect(res.statusCode).toBe(400);
      expect(res.text).toBe("post-id and text are required");
    });
  });

  describe("GET /api/comments/post/:postId/count", () => {
    test("returns correct count of comments for an existing post", async () => {
      await CommentModel.create([
        { postId, userId, text: "This is my comment." },
        { postId, userId, text: "This is another comment." },
      ]);

      const res = await request(app).get(`/api/comments/post/${postId}/count`).set("Cookie", authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(2);
    });

    test("returns not-found status when trying to get comment count of a non-existent post", async () => {
      const fakePostId = new mongoose.Types.ObjectId().toString();

      const res = await request(app).get(`/api/comments/post/${fakePostId}/count`).set("Cookie", authCookies);

      expect(res.statusCode).toBe(404);
      expect(res.text).toBe("post not found");
    });
  });

  describe("GET /api/comments/post/:postId", () => {
    test("returns all comments for a post with populated user info", async () => {
      await CommentModel.create({ postId, userId, text: "This is my comment." });

      const res = await request(app).get(`/api/comments/post/${postId}`).set("Cookie", authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].text).toBe("This is my comment.");
      expect(res.body[0].userId).toHaveProperty("_id", userId);
      expect(res.body[0].userId).toHaveProperty("username", "UserOne");
    });

    test("returns comments in descending order", async () => {
      await CommentModel.create({ postId, userId, text: "This is a new comment.", createdAt: new Date() });
      await CommentModel.create({
        postId,
        userId,
        text: "This is an old comment",
        createdAt: new Date(Date.now() - 10000),
      });

      const res = await request(app).get(`/api/comments/post/${postId}`).set("Cookie", authCookies);

      expect(res.body[0].text).toBe("This is a new comment.");
      expect(res.body[1].text).toBe("This is an old comment");
    });
  });
});
