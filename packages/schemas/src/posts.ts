import z from "zod";

export const newPostDataSchema = z.object({ imageUrl: z.string(), text: z.string() });
export type NewPostData = z.infer<typeof newPostDataSchema>;

export const postDataSchema = newPostDataSchema.extend({
  _id: z.string(),
  userId: z.object({ _id: z.string(), username: z.string(), imgUrl: z.string() }),
  createdAt: z.date(),
});
export type PostData = z.infer<typeof postDataSchema>;

export const updatePostDataSchema = newPostDataSchema.partial();
export type UpdatePostData = z.infer<typeof updatePostDataSchema>;
