import { baseApi } from "./baseApi";

type NewPostData = {
  userId: string;
  imageUrl: string;
  text: string;
};

export type PostData = NewPostData & {
  _id: string;
  createdAt: Date;
};

export const getHomeFeedPosts = (loggedInUserId: string) => ({
  fn: () => baseApi.get<PostData[]>(`/posts/home-feed/${loggedInUserId}`).then((response) => response.data),
  key: ["posts", "home-feed", loggedInUserId] as const,
});

export const createNewPost = {
  fn: (newPostData: NewPostData) => baseApi.post<PostData>(`/posts`, newPostData).then((response) => response.data),
  key: ["posts", "create"] as const,
};

export const getPostsByUserId = (userId: string) => ({
  fn: () => baseApi.get<PostData[]>(`/posts/user/${userId}`).then((response) => response.data),
  key: ["posts", userId] as const,
});
