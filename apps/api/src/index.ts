import dotenv from "dotenv";
import mongoose from "mongoose";
import { env } from "./env.js";
import { createApp } from "./app.js";

dotenv.config();

const app = createApp();
const port = env.PORT;

mongoose
  .connect(env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
