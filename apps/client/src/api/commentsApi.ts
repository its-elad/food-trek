import type { CommentData, CommentsCount, NewCommentData } from "@food-trek/schemas";
import { baseApi } from "./baseApi";

export const addComment = {
  fn: (newCommentData: NewCommentData) => baseApi.post("/comments", newCommentData).then((response) => response.data),
  key: ["comments", "add"] as const,
};

export const getCommentsCountByPostId = (postId: string) => ({
  fn: () => baseApi.get<CommentsCount>(`/comments/post/${postId}/count`).then((response) => response.data),
  key: ["comments", postId, "count"] as const,
});

export const getCommentsByPostId = (postId: string) => ({
  fn: () => baseApi.get<CommentData[]>(`/comments/post/${postId}`).then((response) => response.data),
  key: ["comments", postId] as const,
});
