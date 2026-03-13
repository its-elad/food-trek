import express from "express";
import postController from "../controllers/posts.controller.js";

const router = express.Router();

router.post("/", postController.createPost);
router.get("/home-feed/:id", postController.getHomeFeedPosts);
router.get("/user/:id", postController.getPostsByUserId);

export default router;
