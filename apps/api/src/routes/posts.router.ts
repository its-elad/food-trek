import express from "express";
import postsController from "../controllers/posts.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, postsController.createPost);
router.get("/home-feed", authenticate, postsController.getHomeFeedPosts);
router.get("/user-page", authenticate, postsController.getLoggedInUserPosts);
router.patch("/:postId", authenticate, postsController.updatePost);
router.delete("/:postId", authenticate, postsController.deletePost);

export default router;
