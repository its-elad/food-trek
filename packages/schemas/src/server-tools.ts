import { toolDefinition } from "@tanstack/ai";
import z from "zod";

export const getCurrentTimeServerDef = toolDefinition({
  name: "get_current_time",
  description: "Get the current server date and time. Use this when the user asks what time or date it is.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    iso: z.string().describe("ISO 8601 timestamp"),
    date: z.string().describe("Human-readable date, e.g. Monday, March 2 2026"),
    time: z.string().describe("Human-readable time, e.g. 14:35:22"),
    timezone: z.string().describe("Server timezone"),
  }),
});

const searchPostsInputSchema = z.object({
  query: z.string().min(2).max(120).describe("Free-text search phrase, e.g. 'spicy ramen in tokyo'"),
  limit: z.number().int().min(1).max(10).default(5).describe("Maximum number of matching posts to return"),
});
export type SearchPostsInput = z.infer<typeof searchPostsInputSchema>;
const searchPostsOutputSchema = z.object({
  posts: z.string().describe("A Toon encoded JSON string containing an array of matching posts."),
});
export type SearchPostsOutput = z.infer<typeof searchPostsOutputSchema>;
export const searchPostsServerDef = toolDefinition({
  name: "search_posts",
  description:
    "Search public posts by free text using MongoDB text search relevance. Use this when the user asks to find posts about a topic, ingredient, place, or phrase.",
  inputSchema: searchPostsInputSchema,
  outputSchema: searchPostsOutputSchema,
});
