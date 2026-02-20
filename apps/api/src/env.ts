import z from "zod";

const envSchema = z.object({
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  SERVER_URL: z.string().default("http://localhost:3000"),
  CLIENT_URL: z.string().default("http://localhost:8080"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
});

export const env = envSchema.parse(process.env);
