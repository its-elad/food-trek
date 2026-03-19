import mongoose from "mongoose";
import { env } from "./env.js";
import { createApp } from "./app.js";
import http from "http";
import https from "https";
import { readFileSync } from "fs";

const app = createApp();
const port = env.PORT;

mongoose
  .connect(env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

if (env.NODE_ENV === "production" && env.SSL_KEY_PATH && env.SSL_CERT_PATH) {
  console.log("Running in production mode");
  https
    .createServer(
      {
        key: readFileSync(env.SSL_KEY_PATH),
        cert: readFileSync(env.SSL_CERT_PATH),
      },
      app
    )
    .listen(port, () => {
      console.log(`Server running at https://localhost:${port}`);
    });
} else {
  console.log("Running in development mode");
  http.createServer(app).listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}
