import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../app.js";
import PostModel from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { extractCookies } from "./utils/extract-cookies.js";

let app: Express;
let mongoMemoryServer: MongoMemoryServer;
let authCookies: string[];
let userId: string;

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

beforeEach(async () => await PostModel.deleteMany({}));

describe("Posts Controller", () => {
  const newPostData = {
    imageUrl: "https://example.com/image.jpg",
    text: "This is my new post.",
  };

  describe("POST /api/posts", () => {
    test("successfully saves a new post", async () => {
      const res = await request(app).post("/api/posts").set("Cookie", authCookies).send(newPostData);

      expect(res.statusCode).toBe(201);
      expect(res.body.userId).toBe(userId);
    });
  });

  describe("GET /api/posts/home-feed", () => {
    test("returns all posts except those of the logged-in user", async () => {
      const anotherUser = await User.create({
        username: "UserTwo",
        email: "example@hotmail.com",
        password: "password123",
      });
      const anotherUserId = anotherUser._id.toString();

      await PostModel.create({ ...newPostData, userId: anotherUserId });
      await PostModel.create({ ...newPostData, userId });

      const res = await request(app).get("/api/posts/home-feed").set("Cookie", authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].userId._id).toBe(anotherUserId);
    });

    test("returns post without user data if the user no longer exists in the database", async () => {
      await PostModel.create({ ...newPostData, userId: new mongoose.Types.ObjectId().toString() });

      const res = await request(app).get("/api/posts/home-feed").set("Cookie", authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toBeDefined();
      expect(res.body[0].userId).toBeNull();
    });
  });

  describe("GET /api/posts/user-page", () => {
    test("returns only posts of the logged-in user", async () => {
      await PostModel.create({ ...newPostData, userId });
      await PostModel.create({ ...newPostData, userId: "123456789" });

      const res = await request(app).get("/api/posts/user-page").set("Cookie", authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].userId._id).toBe(userId);
    });
  });

  describe("PATCH /api/posts/:postId", () => {
    test("succesfully updating an existing post", async () => {
      const { _id: postId } = await PostModel.create({ ...newPostData, userId });

      const res = await request(app)
        .patch(`/api/posts/${postId}`)
        .set("Cookie", authCookies)
        .send({ text: "This is my updated post." });

      expect(res.statusCode).toBe(200);
      expect(res.body.text).toBe("This is my updated post.");
    });

    test("prevents updating when attempting to update a post by a different user than the logged-in user", async () => {
      const { _id: anotherPostId } = await PostModel.create({ ...newPostData, userId: "123456789" });

      const res = await request(app)
        .patch(`/api/posts/${anotherPostId}`)
        .set("Cookie", authCookies)
        .send({ text: "This is my updated post." });

      expect(res.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/posts/:postId", () => {
    test("succesfully deleting an existing post", async () => {
      const { _id: postId } = await PostModel.create({ ...newPostData, userId });

      const res = await request(app).delete(`/api/posts/${postId}`).set("Cookie", authCookies);

      expect(res.statusCode).toBe(200);
      expect(res.body.postsDeletedCount).toBe(1);
    });
  });
});
