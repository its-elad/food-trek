import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model.js";
import { googleLoginSchema, loginSchema, registerSchema, updateUserSchema, UserInfo } from "@food-trek/schemas";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { env } from "../env.js";
import { sendError } from "../common/utils.js";

const ACCESS_MAX_AGE = 24 * 60 * 60 * 1000; // 1 day
const REFRESH_MAX_AGE = 2 * 24 * 60 * 60 * 1000; // 2 days

const COOKIE_BASE = {
  httpOnly: true,
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
} as const;

type Tokens = { accessToken: string; refreshToken: string };

const generateTokens = (userId: string): Tokens => {
  const secret = env.JWT_SECRET!;
  const accessToken = jwt.sign({ _id: userId }, secret, {
    expiresIn: ACCESS_MAX_AGE / 1000,
  });
  const refreshToken = jwt.sign({ _id: userId, rand: Math.floor(Math.random() * 1000000) }, secret, {
    expiresIn: REFRESH_MAX_AGE / 1000,
  });
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
  const { username, email, password, imgUrl } = parsedBody.data;

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
      imgUrl,
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
      imgUrl: user.imgUrl,
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
    const user = await User.findOne({
      username,
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
      imgUrl: user.imgUrl,
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
    let decoded = null;
    try {
      decoded = jwt.verify(refreshToken, secret) as {
        _id: string;
      };
    } catch (error) {
      console.error(error);
      return sendError(res, 401, "Invalid refresh token");
    }
    const user = await User.findById(decoded._id);

    if (!user) {
      return sendError(res, 401, "Invalid refresh token");
    }

    if (!user.refreshTokens.includes(refreshToken)) {
      // Token theft detected – invalidate all sessions
      user.refreshTokens = [];
      await user.save();
      clearTokenCookies(res);
      console.warn("Possible token theft for user:", user._id);
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
      imgUrl: user.imgUrl,
    } satisfies UserInfo);
  } catch (err) {
    console.error("refresh error", err);
    sendError(res, 500, "Invalid or expired refresh token");
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
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
        await user.save();
      }
    } catch {
      /* Empty */
    }
  }

  clearTokenCookies(res);
  res.sendStatus(204);
};

export const getUser = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 401, "Not authenticated");
  }

  try {
    const user = await User.findById(req.user._id, {
      password: 0,
      refreshTokens: 0,
    });
    if (!user) return sendError(res, 401, "User not found");
    res.json({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      imgUrl: user.imgUrl,
    } satisfies UserInfo);
  } catch (error) {
    console.error("getUser error", error);
    sendError(res, 500, "Internal server error");
  }
};

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const googleAuth = async (req: Request, res: Response) => {
  const parsedBody = googleLoginSchema.safeParse(req.body);
  if (parsedBody.success === false) {
    return sendError(res, 400, "Google credential is required");
  }
  const { credential } = parsedBody.data;

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
      const username = (rawName.split("@")[0] ?? rawName).replace(/\s+/g, "_").toLowerCase();
      // Ensure username uniqueness
      const uniqueUsername = await ensureUniqueUsername(username);
      user = await User.create({
        username: uniqueUsername,
        email,
        googleId,
        imgUrl: picture,
      });
    } else if (!user.googleId) {
      // Existing email-based account – link Google
      user.googleId = googleId;
      if (picture && !user.imgUrl) user.imgUrl = picture;
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
      imgUrl: user.imgUrl,
    } satisfies UserInfo);
  } catch (err) {
    console.error("google auth error", err);
    sendError(res, 401, "Google authentication failed");
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) return sendError(res, 401, "Not authenticated");

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid data");

  const { username, imgUrl } = parsed.data;
  if (username === undefined && imgUrl === undefined) {
    return sendError(res, 400, "At least one field (username or imgUrl) must be provided");
  }

  try {
    if (username) {
      const existing = await User.findOne({
        username,
        _id: { $ne: userId },
      });
      if (existing) return sendError(res, 409, "Username already in use");
    }
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(!!username && { username }),
        ...(!!imgUrl && { imgUrl }),
      },
      { new: true }
    );
    if (!user) return sendError(res, 404, "User not found");

    res.json({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      imgUrl: user.imgUrl,
    } satisfies UserInfo);
  } catch (err) {
    console.error("update user error", err);
    sendError(res, 500);
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
