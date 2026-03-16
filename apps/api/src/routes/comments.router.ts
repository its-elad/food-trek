import express from "express";
import commentsController from "../controllers/comments.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, commentsController.addComment);
router.get("/post/:postId/count", authenticate, commentsController.getCommentsCountByPostId);
router.get("/post/:postId", authenticate, commentsController.getCommentsByPostId);

export default router;
