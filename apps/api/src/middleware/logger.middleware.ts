import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { env } from "../env.js";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!env.IS_TEST_MODE) {
    res.on("finish", () => {
      const user = (req as AuthRequest).user?._id ?? "anonymous";
      const text = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | ${res?.statusCode} | ${user} | ip=${req.ip}`;
      if (res.statusCode >= 400 && res.statusCode < 600) {
        console.error(text);
      } else {
        console.log(text);
      }
    });
  }

  next();
};
