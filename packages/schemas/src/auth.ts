import z from "zod";

export const userInfoSchema = z.object({
  _id: z.string(),
  username: z.string().trim().min(1, "Username is required"),
  email: z.email().trim().min(1, "Email is required"),
  profileImage: z.url().nullish(),
});
export type UserInfo = z.infer<typeof userInfoSchema>;

const passwordSchema = z
  .string()
  .trim()
  .min(6, "Password must be at least 6 characters");

export const loginSchema = z.object({
  username: userInfoSchema.shape.username,
  password: passwordSchema,
});
export type LoginReq = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: userInfoSchema.shape.username,
  email: userInfoSchema.shape.email,
  password: passwordSchema,
});
export type RegisterReq = z.infer<typeof registerSchema>;
