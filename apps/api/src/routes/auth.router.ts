import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  googleAuth,
  getUser,
  updateUser,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/refresh", refresh);

authRouter.post("/logout", logout);

authRouter.post("/google", googleAuth);

authRouter.get("/user", authenticate, getUser);

authRouter.patch("/user", authenticate, updateUser);

export { authRouter };
