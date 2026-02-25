import request from "supertest";
import { Express } from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";
import path from "path";
import { createApp } from "../app.js";

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

  // Clean up any uploaded files created during tests
  const uploadsDir = path.join(process.cwd(), "public");
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      if (/^\d+\.(png|jpg|jpeg|gif|webp)$/i.test(file.toLowerCase())) {
        try {
          fs.unlinkSync(path.join(uploadsDir, file));
        } catch {}
      }
    }
  }
});

describe("POST /api/files", () => {
  /**
   * Minimal valid 1×1 pixel PNG (base64-encoded).
   * Using a real PNG binary ensures multer's image mime-type check passes.
   */
  const minimalPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk" +
      "+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  test("uploads a valid PNG file and returns 200 with a URL", async () => {
    const res = await request(app)
      .post("/api/files")
      .attach("file", minimalPng, {
        filename: "pixel.png",
        contentType: "image/png",
      });

    expect(res.statusCode).toBe(200);
    expect(typeof res.body.url).toBe("string");
    expect(res.body.url?.length).toBeGreaterThan(0);
  });

  test("uploaded image can be retrieved via the returned URL", async () => {
    const uploadRes = await request(app)
      .post("/api/files")
      .attach("file", minimalPng, {
        filename: "missingno.png",
        contentType: "image/png",
      });

    expect(uploadRes.statusCode).toBe(200);
    expect(typeof uploadRes.body.url).toBe("string");
    const filePath = new URL(uploadRes.body.url).pathname;

    const getRes = await request(app).get(filePath);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers["content-type"]).toMatch(/^image\//);
  });

  test("uploads a JPEG file and returns 200 with a URL", async () => {
    // Minimal JPEG header bytes (SOI + APP0 marker, enough for mime detection)
    const minimalJpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    ]);

    const res = await request(app)
      .post("/api/files")
      .attach("file", minimalJpeg, {
        filename: "test-image.jpg",
        contentType: "image/jpeg",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.url?.length).toBeGreaterThan(0);
  });

  test("returns 400 when uploading a non-image file (text/plain)", async () => {
    const textContent = Buffer.from("Luke, I am your father.");

    const res = await request(app)
      .post("/api/files")
      .attach("file", textContent, {
        filename: "note.txt",
        contentType: "text/plain",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("handles a missing file field gracefully (400 or 500)", async () => {
    const res = await request(app).post("/api/files");

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
