import { chat, convertMessagesToModelMessages, toServerSentEventsStream } from "@tanstack/ai";
import { Readable } from "stream";
import { showNotificationClientDef } from "@food-trek/schemas";
import { Router, Request, Response } from "express";
import { getCurrentTime, searchPosts } from "../ai/tools.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { openRouterProvider } from "../ai/provider.js";

export const chatRouter = Router();
chatRouter.use(authenticate);

chatRouter.post("/", async (req: Request, res: Response) => {
  const { messages, data } = req.body;
  const conversationId = data?.conversationId;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const modelMessages = convertMessagesToModelMessages(messages);

    const chatStream = chat({
      adapter: openRouterProvider,
      messages: modelMessages as never,
      stream: true,
      conversationId,
      systemPrompts: [
        `
        You are a helpful assistant for a food discovery app called FoodTrek.
        Users can ask you to find dishes, ingredients, restaurants, and travel tips related to food.
        You should search recent public posts from other users to find relevant information.
        Always try to help the user with their food-related questions and requests.
        If an Error occurs when running a tool, catch it and show a user-friendly message.
        Without running the tool again
        `,
      ],
      tools: [getCurrentTime, searchPosts, showNotificationClientDef],
    });

    const sseStream = toServerSentEventsStream(chatStream);
    const nodeStream = Readable.fromWeb(sseStream as never);

    nodeStream.on("error", (err) => {
      console.error("SSE stream error:", err);
      res.end();
    });

    nodeStream.pipe(res);
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    res.write(`data: ${JSON.stringify({ type: "RUN_ERROR", error: { message } })}\n\n`);
    res.end();
  }
});
