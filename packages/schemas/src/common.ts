import z from "zod";

export const errorResSchema = z.object({ message: z.string() }).meta({
  id: "ErrorResponse",
  description: "Error message",
});
export type ErrorRes = z.infer<typeof errorResSchema>;
