import z from "zod";

export const getExampleSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
});
export type Example = z.infer<typeof getExampleSchema>;
