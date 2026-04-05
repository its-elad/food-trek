import express from "express";
import postsController from "../controllers/posts.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", postsController.createPost);
router.get("/home-feed", postsController.getHomeFeedPosts);
router.get("/user-page", postsController.getLoggedInUserPosts);
router.patch("/:postId", postsController.updatePost);
router.delete("/:postId", postsController.deletePost);

// RAG embedding routes
router.post("/embedding-batch/update-all", postsController.updateAllEmbeddings);

export default router;
