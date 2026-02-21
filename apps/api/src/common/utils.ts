import { ErrorRes } from "@food-trek/schemas";
import { Response } from "express";

export const sendError = (res: Response, code: number, message?: string) =>
  res
    .status(code)
    .json({ message: message ?? "Internal server error" } satisfies ErrorRes);
