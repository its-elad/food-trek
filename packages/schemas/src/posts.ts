import z from "zod";

export const NewPostDataSchema = z.object({ imageUrl: z.string(), text: z.string() });
export type NewPostData = z.infer<typeof NewPostDataSchema>;

const PostDataSchema = NewPostDataSchema.extend({
  _id: z.string(),
  userId: z.object({ _id: z.string(), username: z.string(), imgUrl: z.string() }),
  createdAt: z.date(),
});
export type PostData = z.infer<typeof PostDataSchema>;
