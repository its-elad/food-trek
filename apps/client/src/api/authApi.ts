import axios from "axios";
import type { LoginReq, RegisterReq, UserInfo } from "@food-trek/schemas";
import { baseApi } from "./baseApi";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const getUserInfo = () => ({
  fn: () =>
    axios
      .get<UserInfo>(`${API_BASE_URL}/auth/user`, { withCredentials: true })
      .then((r) => r.data),
  key: ["auth", "user"] as const,
});

export const registerUser = () => ({
  fn: (data: RegisterReq) =>
    baseApi.post<UserInfo>("/auth/register", data).then((r) => r.data),
  key: ["auth", "register"] as const,
});

export const loginUser = () => ({
  fn: (data: LoginReq) =>
    baseApi.post<UserInfo>("/auth/login", data).then((r) => r.data),
  key: ["auth", "login"] as const,
});

export const refreshSession = () => ({
  fn: () => baseApi.post<UserInfo>("/auth/refresh").then((r) => r.data),
  key: ["auth", "refresh"] as const,
});

export const logoutUser = () => ({
  fn: () => baseApi.post("/auth/logout").then(() => null),
  key: ["auth", "logout"] as const,
});

export const googleLogin = () => ({
  fn: (credential: string) =>
    baseApi.post<UserInfo>("/auth/google", { credential }).then((r) => r.data),
  key: ["auth", "google"] as const,
});
