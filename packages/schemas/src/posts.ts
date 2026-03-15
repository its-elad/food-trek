import z from "zod";

export const NewPostDataSchema = z.object({ imageUrl: z.string(), text: z.string() });
export type NewPostData = z.infer<typeof NewPostDataSchema>;

export const PostDataSchema = NewPostDataSchema.extend({
  _id: z.string(),
  userId: z.object({ _id: z.string(), username: z.string(), imgUrl: z.string() }),
  createdAt: z.date(),
});
export type PostData = z.infer<typeof PostDataSchema>;

export const UpdatePostDataSchema = NewPostDataSchema.partial();
export type UpdatePostData = z.infer<typeof UpdatePostDataSchema>;
