import express from "express";
import commentsController from "../controllers/comments.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", commentsController.addComment);
router.get("/post/:postId/count", commentsController.getCommentsCountByPostId);
router.get("/post/:postId", commentsController.getCommentsByPostId);

export default router;
