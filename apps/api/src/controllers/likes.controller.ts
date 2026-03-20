import { Response } from "express";
import PostModel from "../models/post.model.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { newLikeDataSchema } from "@food-trek/schemas";
import LikeModel from "../models/like.model.js";

const addLike = async (req: AuthRequest, res: Response) => {
  const parsedBody = newLikeDataSchema.safeParse(req.body);

  if (parsedBody.success === false) {
    return res.status(400).send("post-id is required");
  }

  try {
    const likedPost = await PostModel.findById(parsedBody.data.postId);

    if (!likedPost) {
      return res.status(404).send("post not found");
    }

    const newLike = await LikeModel.create({ ...parsedBody.data, userId: req.user?._id });
    res.status(201).json(newLike);
  } catch (error) {
    console.error(error);
    res.status(500).send("error adding like");
  }
};

const getLoggedInUserLikeByPostId = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId;

  if (!postId) {
    return res.status(400).send("post-id is required");
  }

  try {
    const foundPost = await PostModel.findById(postId);

    if (!foundPost) {
      return res.status(404).send("post not found");
    }

    const foundLike = await LikeModel.findOne({ userId: req.user?._id, postId });
    res.status(200).json(foundLike);
  } catch (error) {
    console.error(error);
    res.status(500).send("error retrieving like");
  }
};

const getLikesCountByPostId = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId;

  if (!postId) {
    return res.status(400).send("post-id is required");
  }

  try {
    const foundPost = await PostModel.findById(postId);

    if (!foundPost) {
      return res.status(404).send("post not found");
    }

    const likesCount = await LikeModel.countDocuments({ postId });
    res.status(200).json({ count: likesCount });
  } catch (error) {
    console.error(error);
    res.status(500).send("error retrieving likes count");
  }
};

export default { addLike, getLoggedInUserLikeByPostId, getLikesCountByPostId };
