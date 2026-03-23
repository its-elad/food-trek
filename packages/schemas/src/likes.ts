import z from "zod";

export const newLikeDataSchema = z.object({ postId: z.string() }).meta({
  id: "NewLikeData",
  description: "Data required to add a new like",
  example: { postId: "69b03e410a51fe792ef39255" },
});
export type NewLikeData = z.infer<typeof newLikeDataSchema>;

export const likeDataSchema = newLikeDataSchema
  .extend({ _id: z.string(), userId: z.string(), createdAt: z.date() })
  .nullable()
  .meta({
    id: "LikeData",
    description: "Public like information",
    example: {
      _id: "69b03e410a51fe792ef39257",
      postId: "69b03e410a51fe792ef39255",
      userId: "69b03e410a51fe792ef39253",
      createdAt: new Date(),
    },
  });
export type LikeData = z.infer<typeof likeDataSchema>;

export const likesCountSchema = z.object({ count: z.number() }).meta({
  id: "LikesCount",
  description: "Like count for a specific post",
  example: { count: 10 },
});
export type LikesCount = z.infer<typeof likesCountSchema>;
