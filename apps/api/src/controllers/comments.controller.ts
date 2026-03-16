import { Response } from "express";
import PostModel from "../models/post.model.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import CommentModel from "../models/comment.model.js";
import { NewCommentDataSchema } from "@food-trek/schemas";

const addComment = async (req: AuthRequest, res: Response) => {
  const parsedBody = NewCommentDataSchema.safeParse(req.body);

  if (parsedBody.success === false) {
    return res.status(400).send("post-id and text are required");
  }

  try {
    const commentedPost = await PostModel.findById(parsedBody.data.postId);

    if (!commentedPost) {
      return res.status(404).send("post not found");
    }

    const newComment = await CommentModel.create({ ...parsedBody.data, userId: req.user?._id });
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).send("error creating comment");
  }
};

const getCommentsCountByPostId = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId;

  if (!postId) {
    return res.status(400).send("post-id is required");
  }

  try {
    const foundPost = await PostModel.findById(postId);

    if (!foundPost) {
      return res.status(404).send("post not found");
    }

    const commentsCount = await CommentModel.countDocuments({ postId: postId });
    res.status(200).json({ count: commentsCount });
  } catch (error) {
    console.error(error);
    res.status(500).send("error retrieving comments count");
  }
};

const getCommentsByPostId = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId;

  if (!postId) {
    return res.status(400).send("post-id is required");
  }

  try {
    const foundPost = await PostModel.findById(postId);

    if (!foundPost) {
      return res.status(404).send("post not found");
    }

    const postComments = await CommentModel.find({ postId })
      .populate("userId", "username imgUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(postComments);
  } catch (error) {
    console.error(error);
    res.status(500).send("error retrieving comments");
  }
};

export default { addComment, getCommentsCountByPostId, getCommentsByPostId };
