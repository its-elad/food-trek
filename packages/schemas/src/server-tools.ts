import { toolDefinition } from "@tanstack/ai";
import z from "zod";

export const getCurrentTimeServerDef = toolDefinition({
  name: "get_current_time",
  description:
    "Get the current server date and time. Use this when the user asks what time or date it is.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    iso: z.string().describe("ISO 8601 timestamp"),
    date: z.string().describe("Human-readable date, e.g. Monday, March 2 2026"),
    time: z.string().describe("Human-readable time, e.g. 14:35:22"),
    timezone: z.string().describe("Server timezone"),
  }),
});