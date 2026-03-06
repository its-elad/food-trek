import { toolDefinition } from "@tanstack/ai";
import z from "zod";

export const showNotificationInputSchema = z.object({
  message: z.string().describe("The notification message to display"),
  type: z.enum(["success", "error", "info", "warning"]).describe("Visual style of the notification"),
});
export type ShowNotificationInput = z.infer<typeof showNotificationInputSchema>;
export const showNotificationClientDef = toolDefinition({
  name: "show_notification",
  description:
    "Display a notification banner to the user in the chat UI. Use this to highlight important information, confirmations, or warnings in a visually distinct way.",
  inputSchema: showNotificationInputSchema,
  outputSchema: z.object({
    shown: z.boolean(),
  }),
});
