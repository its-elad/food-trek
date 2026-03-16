import z from "zod";

export const NewCommentDataSchema = z.object({ postId: z.string(), text: z.string() });
export type NewCommentData = z.infer<typeof NewCommentDataSchema>;

export const CommentsCountSchema = z.object({ count: z.number() });
export type CommentsCount = z.infer<typeof CommentsCountSchema>;

export const CommentDataSchema = NewCommentDataSchema.extend({
  _id: z.string(),
  userId: z.object({ _id: z.string(), username: z.string(), imgUrl: z.string() }),
  createdAt: z.date(),
});
export type CommentData = z.infer<typeof CommentDataSchema>;
