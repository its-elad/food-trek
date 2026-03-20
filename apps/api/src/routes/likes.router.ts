import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import likesController from "../controllers/likes.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/", likesController.addLike);
router.get("/logged-in-user/post/:postId", likesController.getLoggedInUserLikeByPostId);
router.get("/post/:postId/count", likesController.getLikesCountByPostId);

export default router;
