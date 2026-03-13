import { baseApi } from "./baseApi";

type UserData = {
  _id: String;
  username: String;
  email: String;
  password: string;
  imgUrl: string;
  refreshTokens: string[];
  __v: number;
};

export const getUserById = (userId: string) => ({
  fn: () => baseApi.get<UserData>(`/users/${userId}`).then((response) => response.data),
  key: ["users", userId] as const,
});
