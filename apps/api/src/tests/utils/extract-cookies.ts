import request from "supertest";

export const extractCookies = (res: request.Response): string[] => {
  const cookieHeader = res.headers["set-cookie"];

  return cookieHeader ? (Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader]) : [];
};
