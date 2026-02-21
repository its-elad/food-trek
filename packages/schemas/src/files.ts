import z from "zod";

export const uploadFileResSchema = z
  .object({
    url: z.string(),
  })
  .meta({
    id: "UploadFileResponse",
    description: "URL of the uploaded file",
    example: { url: "http://localhost:3000/public/1700000000000.jpg" },
  });
export type UploadFileRes = z.infer<typeof uploadFileResSchema>;
