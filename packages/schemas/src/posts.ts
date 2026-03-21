import z from "zod";

export const newPostDataSchema = z.object({ imageUrl: z.string(), text: z.string() }).meta({
  id: "NewPostData",
  description: "Data required to add a new post",
  example: { imageUrl: "https://example.com/image.jpg", text: "This is my new post." },
});
export type NewPostData = z.infer<typeof newPostDataSchema>;

export const postDataSchema = newPostDataSchema
  .extend({
    _id: z.string(),
    userId: z.object({ _id: z.string(), username: z.string(), imgUrl: z.string() }),
    createdAt: z.date(),
  })
  .meta({
    id: "PostData",
    description: "Public post information",
    example: {
      _id: "69b03e410a51fe792ef39255",
      userId: { _id: "69b03e410a51fe792ef39256", username: "UserOne", imgUrl: "https://example.com/avatar.jpg" },
      imageUrl: "https://example.com/image.jpg",
      text: "This is my new post.",
      createdAt: new Date(),
    },
  });
export type PostData = z.infer<typeof postDataSchema>;

export const updatePostDataSchema = newPostDataSchema.partial().meta({
  id: "UpdatePostData",
  description: "Data to update an existing post",
  example: { imageUrl: "https://example.com/image.png", text: "This is my updated post." },
});
export type UpdatePostData = z.infer<typeof updatePostDataSchema>;
