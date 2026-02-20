import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  googleAuth,
  getUser,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/refresh", refresh);

authRouter.post("/logout", logout);

authRouter.post("/google", googleAuth);

authRouter.get("/user", getUser);

export { authRouter };
