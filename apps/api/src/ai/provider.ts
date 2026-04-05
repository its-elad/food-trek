import { createOpenRouterText } from "@tanstack/ai-openrouter";
import { env } from "../env.js";

export const openRouterProvider = createOpenRouterText(env.OPENROUTER_MODEL, env.OPENROUTER_API_KEY)