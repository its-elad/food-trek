import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import { loginSchema, registerSchema, UserInfo } from "@food-trek/schemas";
import { env } from "../env.js";

const sendError = (res: Response, code: number, message: string) =>
  res.status(code).json({ message });

const ACCESS_MAX_AGE = 3600 * 1000;
const REFRESH_MAX_AGE = 604800 * 1000;

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
} as const;

type Tokens = { accessToken: string; refreshToken: string };

const generateTokens = (userId: string): Tokens => {
  const secret = env.JWT_SECRET!;
  const accessToken = jwt.sign({ _id: userId }, secret, {
    expiresIn: ACCESS_MAX_AGE / 1000,
  });
  const refreshToken = jwt.sign(
    { _id: userId, rand: Math.floor(Math.random() * 1000000) },
    secret,
    { expiresIn: REFRESH_MAX_AGE / 1000 }
  );
  return { accessToken, refreshToken };
};

const setTokenCookies = (res: Response, tokens: Tokens) => {
  res.cookie("accessToken", tokens.accessToken, {
    ...COOKIE_BASE,
    maxAge: ACCESS_MAX_AGE,
  });
  res.cookie("refreshToken", tokens.refreshToken, {
    ...COOKIE_BASE,
    maxAge: REFRESH_MAX_AGE,
  });
};

const clearTokenCookies = (res: Response) => {
  res.clearCookie("accessToken", COOKIE_BASE);
  res.clearCookie("refreshToken", COOKIE_BASE);
};

export const register = async (req: Request, res: Response) => {
  const parsedBody = registerSchema.safeParse(req.body);

  if (parsedBody.success === false) {
    return sendError(res, 400, "username, email, and password are required");
  }
  const { username, email, password } = parsedBody.data;

  try {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return sendError(res, 409, "Username or email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      refreshTokens: [],
    });

    const tokens = generateTokens(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    setTokenCookies(res, tokens);
    res.status(201).json({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    } satisfies UserInfo);
  } catch (err) {
    console.error("register error", err);
    sendError(res, 500, "Internal server error");
  }
};

export const login = async (req: Request, res: Response) => {
  const parsedBody = loginSchema.safeParse(req.body);

  if (parsedBody.success === false) {
    return sendError(res, 400, "username and password are required");
  }
  const { username, password } = parsedBody.data;

  try {
    // Allow login by username OR email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user || !user.password) {
      return sendError(res, 401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, "Invalid credentials");
    }

    const tokens = generateTokens(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    setTokenCookies(res, tokens);
    res.status(200).json({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    } satisfies UserInfo);
  } catch (err) {
    console.error("login error", err);
    sendError(res, 500, "Internal server error");
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  if (!refreshToken) {
    return sendError(res, 401, "No refresh token");
  }

  const secret = env.JWT_SECRET!;

  try {
    const decoded = jwt.verify(refreshToken, secret) as unknown as {
      _id: string;
    };
    const user = await User.findById(decoded._id);

    if (!user) {
      return sendError(res, 401, "Invalid refresh token");
    }

    if (!user.refreshTokens.includes(refreshToken)) {
      // Token theft detected – invalidate all sessions
      user.refreshTokens = [];
      await user.save();
      clearTokenCookies(res);
      console.warn("⚠️  Possible token theft for user:", user._id);
      return sendError(res, 401, "Invalid refresh token");
    }

    const tokens = generateTokens(decoded._id);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    setTokenCookies(res, tokens);
    res.status(200).json({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    } satisfies UserInfo);
  } catch (_err) {
    sendError(res, 401, "Invalid or expired refresh token");
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;

  if (refreshToken) {
    const secret = env.JWT_SECRET!;
    try {
      const decoded = jwt.verify(refreshToken, secret) as unknown as {
        _id: string;
      };
      const user = await User.findById(decoded._id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (t) => t !== refreshToken
        );
        await user.save();
      }
    } catch {
      // expired token – still clear cookies
    }
  }

  clearTokenCookies(res);
  res.sendStatus(204);
};

export const getUser = async (req: Request, res: Response) => {
  const accessToken = req.cookies.accessToken as string | undefined;

  if (!accessToken) {
    return sendError(res, 401, "Not authenticated");
  }

  const secret = env.JWT_SECRET!;

  try {
    const decoded = jwt.verify(accessToken, secret) as unknown as {
      _id: string;
    };
    const user = await User.findById(decoded._id).select(
      "-password -refreshTokens"
    );
    if (!user) return sendError(res, 401, "User not found");
    res.json({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    } satisfies UserInfo);
  } catch (_err) {
    sendError(res, 401, "Invalid or expired token");
  }
};

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response) => {
  const { credential } = req.body as { credential?: string };

  if (!credential) {
    return sendError(res, 400, "Google credential is required");
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return sendError(res, 401, "Invalid Google token");
    }

    const { sub: googleId, email, name, picture } = payload;

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // First-time Google sign-in – create account
      const rawName: string = name ?? email ?? "user";
      const username = (rawName.split("@")[0] ?? rawName)
        .replace(/\s+/g, "_")
        .toLowerCase();
      // Ensure username uniqueness
      const uniqueUsername = await ensureUniqueUsername(username);
      user = await User.create({
        username: uniqueUsername,
        email,
        googleId,
        profileImage: picture,
      });
    } else if (!user.googleId) {
      // Existing email-based account – link Google
      user.googleId = googleId;
      if (picture && !user.profileImage) user.profileImage = picture;
      await user.save();
    }

    const tokens = generateTokens(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    setTokenCookies(res, tokens);
    res.status(200).json({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
    } satisfies UserInfo);
  } catch (err) {
    console.error("google auth error", err);
    sendError(res, 401, "Google authentication failed");
  }
};

async function ensureUniqueUsername(base: string): Promise<string> {
  let candidate = base;
  let i = 1;
  while (await User.exists({ username: candidate })) {
    candidate = `${base}${i++}`;
  }
  return candidate;
}
