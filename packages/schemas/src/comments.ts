import z from "zod";

export const newCommentDataSchema = z.object({ postId: z.string(), text: z.string() });
export type NewCommentData = z.infer<typeof newCommentDataSchema>;

export const commentsCountSchema = z.object({ count: z.number() });
export type CommentsCount = z.infer<typeof commentsCountSchema>;

export const commentDataSchema = newCommentDataSchema.extend({
  _id: z.string(),
  userId: z.object({ _id: z.string(), username: z.string(), imgUrl: z.string() }),
  createdAt: z.date(),
});
export type CommentData = z.infer<typeof commentDataSchema>;
