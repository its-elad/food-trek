import { Request, Response } from "express";
import PostModel from "../models/post.model.js";

const createPost = async (req: Request, res: Response) => {
  const postBody = req.body;

  if (!postBody.userId || !postBody.imageUrl || !postBody.text) {
    return res.status(400).send("missing required fields (userId, imageUrl, text)");
  }

  try {
    const post = await PostModel.create(postBody);
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send("error creating post");
  }
};

const getHomeFeedPosts = async (req: Request, res: Response) => {
  const loggedInUserId = req.params.id;

  if (!loggedInUserId) {
    return res.status(400).send("logged-in-user-id is required");
  }

  try {
    const posts = await PostModel.find({ userId: { $ne: loggedInUserId } });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send("error retrieving posts");
  }
};

const getPostsByUserId = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).send("user-id is required");
  }

  try {
    const posts = await PostModel.find({ userId: { $eq: userId } });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send("error retrieving posts");
  }
};

export default { createPost, getHomeFeedPosts, getPostsByUserId };
