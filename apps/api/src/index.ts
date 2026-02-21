import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import { env } from "./env.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import { authRouter } from "./routes/auth.router.js";
import { filesRouter } from "./routes/files.router.js";
import { generateOpenAPIDocument } from "./swagger.js";

dotenv.config();

const app = express();
const port = env.PORT;

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true, // allow cookies to be sent cross-origin
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

mongoose
  .connect(env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.use("/api/auth", authRouter);
app.use("/api/files", filesRouter);
app.use("/public", express.static("public"));

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
