import type { LikeData, LikesCount, NewLikeData } from "@food-trek/schemas";
import { baseApi } from "./baseApi";

export const addLike = {
  fn: (newLikeData: NewLikeData) => baseApi.post("/likes", newLikeData).then((response) => response.data),
  key: ["likes", "add"] as const,
};

export const getLoggedInUserLikeByPostId = (postId: string) => ({
  fn: () => baseApi.get<LikeData>(`/likes/logged-in-user/post/${postId}`).then((response) => response.data),
  key: ["likes", "post", postId] as const,
});

export const getLikesCountByPostId = (postId: string) => ({
  fn: () => baseApi.get<LikesCount>(`/likes/post/${postId}/count`).then((response) => response.data),
  key: ["likes", postId, "count"] as const,
});
