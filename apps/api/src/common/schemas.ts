import z from "zod";

export const updateEmbeddingsResSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  updated: z.number(),
  failed: z.number(),
});
export type UpdateEmbeddingsRes = z.infer<typeof updateEmbeddingsResSchema>;
