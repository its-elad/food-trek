import z from "zod";

export const userInfoSchema = z
  .object({
    _id: z.string(),
    username: z.string().trim().min(1, "Username is required"),
    email: z.email().trim().min(1, "Email is required"),
    imgUrl: z.url().nullish(),
  })
  .meta({
    id: "UserInfo",
    description: "Public user information",
    example: {
      _id: "64e1a2b3c4d5e6f7a8b9c0d1",
      username: "johndoe",
      email: "john@example.com",
      imgUrl: "https://example.com/avatar.jpg",
    },
  });
export type UserInfo = z.infer<typeof userInfoSchema>;

const passwordSchema = z
  .string()
  .trim()
  .min(6, "Password must be at least 6 characters");

export const loginSchema = z
  .object({
    username: userInfoSchema.shape.username,
    password: passwordSchema,
  })
  .meta({
    id: "LoginRequest",
    description: "Credentials required to log in",
    example: { username: "johndoe", password: "secret123" },
  });
export type LoginReq = z.infer<typeof loginSchema>;

export const googleLoginSchema = z.object({ credential: z.string() }).meta({
  id: "GoogleAuthRequest",
  description: "Google OAuth ID token",
  example: { credential: "eyJhbGci..." },
});
export type GoogleLoginReq = z.infer<typeof googleLoginSchema>;

export const registerSchema = userInfoSchema
  .pick({ username: true, email: true, imgUrl: true })
  .extend({
    password: passwordSchema,
  })
  .meta({
    id: "RegisterRequest",
    description: "Fields required to create a new account",
    example: {
      username: "johndoe",
      email: "john@example.com",
      password: "secret123",
      imgUrl: "https://example.com/avatar.jpg",
    },
  });
export type RegisterReq = z.infer<typeof registerSchema>;

export const updateUserSchema = userInfoSchema
  .pick({ username: true, imgUrl: true })
  .partial()
  .meta({
    id: "UpdateUserRequest",
    description: "Fields that can be updated on the authenticated user",
    example: { username: "newname", imgUrl: "https://example.com/new.jpg" },
  });
export type UpdateUserReq = z.infer<typeof updateUserSchema>;
