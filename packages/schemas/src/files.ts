import z from "zod";

export const uploadFileResSchema = z.object({
  url: z.string(),
});
export type UploadFileRes = z.infer<typeof uploadFileResSchema>;
