import { Response } from "express";
import PostModel from "../models/post.model.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { NewPostDataSchema } from "@food-trek/schemas";

const createPost = async (req: AuthRequest, res: Response) => {
  const parsedBody = NewPostDataSchema.safeParse(req.body);

  if (parsedBody.success === false) {
    return res.status(400).send("image-url and text are required");
  }

  try {
    const post = await PostModel.create({ ...parsedBody.data, userId: req.user?._id });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send("error creating post");
  }
};

const getHomeFeedPosts = async (req: AuthRequest, res: Response) => {
  try {
    const homeFeedPosts = await PostModel.find({ userId: { $ne: req.user?._id } })
      .populate("userId", "username imgUrl")
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(homeFeedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).send("error retrieving posts");
  }
};

const getLoggedInUserPosts = async (req: AuthRequest, res: Response) => {
  try {
    const posts = await PostModel.find({ userId: req.user?._id })
      .populate("userId", "username imgUrl")
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send("error retrieving posts");
  }
};

export default { createPost, getHomeFeedPosts, getLoggedInUserPosts };
