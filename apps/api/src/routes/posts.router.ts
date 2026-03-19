import express from "express";
import postController from "../controllers/posts.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, postController.createPost);
router.get("/home-feed", authenticate, postController.getHomeFeedPosts);
router.get("/user-page", authenticate, postController.getLoggedInUserPosts);
router.patch("/:postId", authenticate, postController.updatePost);
router.delete("/:postId", authenticate, postController.deletePost);

export default router;
