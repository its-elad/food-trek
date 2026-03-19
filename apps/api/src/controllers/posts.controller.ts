import { Response } from "express";
import PostModel from "../models/post.model.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { NewPostDataSchema, UpdatePostDataSchema } from "@food-trek/schemas";

const createPost = async (req: AuthRequest, res: Response) => {
  const parsedBody = NewPostDataSchema.safeParse(req.body);

  if (parsedBody.success === false) {
    return res.status(400).send("image-url and text are required");
  }

  try {
    const createdPost = await PostModel.create({ ...parsedBody.data, userId: req.user?._id });
    res.status(201).json(createdPost);
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
    const loggedInUserPosts = await PostModel.find({ userId: req.user?._id })
      .populate("userId", "username imgUrl")
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(loggedInUserPosts);
  } catch (error) {
    console.error(error);
    res.status(500).send("error retrieving posts");
  }
};

const updatePost = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId;

  if (!postId) {
    return res.status(400).send("post-id is required");
  }

  const parsedBody = UpdatePostDataSchema.safeParse(req.body);

  if (parsedBody.success === false) {
    return res.status(400).send("invalid update data");
  }

  try {
    const updatedPost = await PostModel.findByIdAndUpdate(postId, parsedBody.data, { new: true });

    if (!updatedPost) {
      return res.status(404).send("post not found");
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).send("error updating post");
  }
};

const deletePost = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId;

  if (!postId) {
    return res.status(400).send("post-id is required");
  }

  try {
    const deletedPost = await PostModel.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).send("post not found");
    }

    res.status(200).json(deletedPost);
  } catch (error) {
    console.error(error);
    res.status(500).send("error deleting post");
  }
};

export default { createPost, getHomeFeedPosts, getLoggedInUserPosts, updatePost, deletePost };
