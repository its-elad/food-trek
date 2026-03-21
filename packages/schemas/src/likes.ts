import z from "zod";

export const newLikeDataSchema = z.object({ postId: z.string() });
export type NewLikeData = z.infer<typeof newLikeDataSchema>;

export const likeDataSchema = newLikeDataSchema
  .extend({ _id: z.string(), userId: z.string(), createdAt: z.date() })
  .nullable();
export type LikeData = z.infer<typeof likeDataSchema>;

export const likesCountSchema = z.object({ count: z.number() });
export type LikesCount = z.infer<typeof likesCountSchema>;
