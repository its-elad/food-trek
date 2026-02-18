import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  googleAuth,
  getUser,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/refresh", refresh);

router.post("/logout", logout);

router.post("/google", googleAuth);

router.get("/user", getUser);

export default router;
