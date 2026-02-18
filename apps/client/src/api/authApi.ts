import axios from "axios";
import type { LoginReq, RegisterReq, UserInfo } from "@food-trek/schemas";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// All auth requests must include credentials so cookies are sent/received
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  withCredentials: true,
});

/** Register – server sets accessToken + refreshToken cookies */
export const registerUser = (data: RegisterReq) =>
  authApi.post<UserInfo>("/register", data).then((r) => r.data);

/** Login – server sets accessToken + refreshToken cookies */
export const loginUser = (data: LoginReq) =>
  authApi.post<UserInfo>("/login", data).then((r) => r.data);

/** Refresh – refreshToken cookie is sent automatically, new cookies are set */
export const refreshSession = () =>
  authApi.post<UserInfo>("/refresh").then((r) => r.data);

/** Logout – clears both cookies on the server */
export const logoutUser = () => authApi.post("/logout");

/** Google – credential JWT from GIS; server sets cookies */
export const googleLogin = (credential: string) =>
  authApi.post<UserInfo>("/google", { credential }).then((r) => r.data);

/** Fetch the currently authenticated user from the accessToken cookie */
export const getUserInfo = () => authApi.get<UserInfo>("/user").then((r) => r.data);
