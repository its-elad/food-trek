import z from "zod";
import { OpenRouterModelOptionsByName } from "@tanstack/ai-openrouter";
const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  SERVER_URL: z.string().default("http://localhost:3000"),
  PORT: z.string().default("3000"),
  CLIENT_URL: z.string().default("http://localhost:8080"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  IS_TEST_MODE: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z
    .string()
    .min(1, "OPENROUTER_MODEL is required")
    .transform((modelName) => {
      return modelName as keyof OpenRouterModelOptionsByName;
    }),
  SSL_KEY_PATH: z.string().optional(),
  SSL_CERT_PATH: z.string().optional(),
});

export const env = envSchema.parse(process.env);
