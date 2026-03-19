import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "./env.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import { authRouter } from "./routes/auth.router.js";
import { chatRouter } from "./routes/chat.router.js";
import { filesRouter } from "./routes/files.router.js";
import commentsRouter from "./routes/comments.router.js";
import postsRouter from "./routes/posts.router.js";
import { generateOpenAPIDocument } from "./swagger.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(requestLogger);

  app.use("/api/auth", authRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/files", filesRouter);
  app.use("/api/posts", postsRouter);
  app.use("/api/comments", commentsRouter);
  app.use("/public", express.static("public"));
  app.use("/", express.static("public/client"));

  const openApiDocument = generateOpenAPIDocument(env.SERVER_URL);
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get("/api/docs.json", (_req: Request, res: Response) => {
    res.json(openApiDocument);
  });

  const welcomeResponse =
    "Welcome to the FoodTrek API, please visit <a href='/api/docs'>/api/docs</a> for API documentation";
  app.get("/api", (_req: Request, res: Response) => {
    res.send(welcomeResponse);
  });
  app.get("/", (_req: Request, res: Response) => {
    res.send(welcomeResponse);
  });

  return app;
}
