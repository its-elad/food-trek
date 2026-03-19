import type { NewPostData, PostData, UpdatePostData } from "@food-trek/schemas";
import { baseApi } from "./baseApi";

export const getHomeFeedPosts = {
  fn: () => baseApi.get<PostData[]>("/posts/home-feed").then((response) => response.data),
  key: ["posts", "home-feed"] as const,
};

export const createNewPost = {
  fn: (newPostData: NewPostData) => baseApi.post("/posts", newPostData).then((response) => response.data),
  key: ["posts", "create"] as const,
};

export const getLoggedInUserPosts = {
  fn: () => baseApi.get<PostData[]>("/posts/user-page").then((response) => response.data),
  key: ["posts", "user-page"] as const,
};

export const updatePost = {
  fn: (postId: string, updatePostData: UpdatePostData) =>
    baseApi.patch(`/posts/${postId}`, updatePostData).then((response) => response.data),
  key: ["posts", "update"] as const,
};

export const deletePost = {
  fn: (postId: string) => baseApi.delete(`/posts/${postId}`).then((response) => response.data),
  key: ["posts", "delete"] as const,
};
