import { getCurrentTimeServerDef, SearchPostsInput, SearchPostsOutput, searchPostsServerDef } from "@food-trek/schemas";
import { encode } from "@toon-format/toon";
import { searchPostsBySemanticSimilarity } from "./rag.js";

export const getCurrentTime = getCurrentTimeServerDef.server(async () => {
  const now = new Date();
  return {
    iso: now.toISOString(),
    date: now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
});

const searchPostsFunc = async ({ query, limit }: SearchPostsInput): Promise<SearchPostsOutput> => {
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, " ").trim();

  const data = encode((await searchPostsBySemanticSimilarity(normalizedQuery)).slice(0, limit));
  return { posts: data };
};

export const searchPosts = searchPostsServerDef.server((args) => searchPostsFunc(args as SearchPostsInput));
