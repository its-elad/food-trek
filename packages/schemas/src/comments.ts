import z from "zod";

export const newCommentDataSchema = z.object({ postId: z.string(), text: z.string() }).meta({
  id: "NewCommentData",
  description: "Data required to add a new comment",
  example: { postId: "69b03e410a51fe792ef39255", text: "This is my comment." },
});
export type NewCommentData = z.infer<typeof newCommentDataSchema>;

export const commentsCountSchema = z.object({ count: z.number() }).meta({
  id: "CommentsCount",
  description: "Comment count for a specific post",
  example: { count: 5 },
});
export type CommentsCount = z.infer<typeof commentsCountSchema>;

export const commentDataSchema = newCommentDataSchema
  .extend({
    _id: z.string(),
    userId: z.object({ _id: z.string(), username: z.string(), imgUrl: z.string() }),
    createdAt: z.date(),
  })
  .meta({
    id: "CommentData",
    description: "Public comment information",
    example: {
      _id: "69b03e410a51fe792ef39259",
      userId: { _id: "69b03e410a51fe792ef39257", username: "UserOne", imgUrl: "https://example.com/avatar.jpg" },
      postId: "69b03e410a51fe792ef39255",
      text: "This is my comment.",
      createdAt: new Date(),
    },
  });
export type CommentData = z.infer<typeof commentDataSchema>;
