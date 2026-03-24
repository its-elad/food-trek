import { Response } from "express";
import PostModel from "../models/post.model.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { newPostDataSchema, PostData, updatePostDataSchema } from "@food-trek/schemas";
import CommentModel from "../models/comment.model.js";
import LikeModel from "../models/like.model.js";
import { PipelineStage } from "mongoose";
import { checkAndUpdatePostEmbedding, searchPostsBySemanticSimilarity, updateAllPostEmbeddings } from "../tools/rag.js";
import PostEmbeddingModel from "../models/postEmbedding.model.js";

const createPost = async (req: AuthRequest, res: Response) => {
  const parsedBody = newPostDataSchema.safeParse(req.body);

  if (parsedBody.success === false) {
    return res.status(400).send("image-url and text are required");
  }

  try {
    const createdPost = await PostModel.create({ ...parsedBody.data, userId: req.user?._id });

    const postId = createdPost._id.toString();
    checkAndUpdatePostEmbedding(postId).catch((error) => {
      console.error(`Failed to create embedding for post ${postId}:`, error);
    });

    res.status(201).json(createdPost);
  } catch (error) {
    console.error(error);
    res.status(500).send("error creating post");
  }
};

const getHomeFeedPosts = async (req: AuthRequest, res: Response) => {
  if (req.query.search && typeof req.query.search !== "string") {
    return res.status(400).send("search query must be a string");
  }
  const search = req.query.search as string | undefined;

  const normalizedQuery = search?.trim();

  if (search) {
    try {
      const homeFeedPosts: PostData[] = await searchPostsBySemanticSimilarity(search);
      return res.status(200).json(homeFeedPosts);
    } catch (error) {
      console.warn("Error searching posts by semantic similarity:", error);
    }
  }
  console.log("Falling back to regular home feed search & retrieval");
  try {
    const matchStage: PipelineStage = { $match: { userId: { $ne: req.user?._id } } };
    const sortingStages: PipelineStage[] = [];
    if (normalizedQuery) {
      matchStage.$match.$text = { $search: normalizedQuery };
      sortingStages.push({ $addFields: { score: { $meta: "textScore" } } }, { $sort: { score: -1, createdAt: -1 } });
    } else {
      sortingStages.push({ $sort: { createdAt: -1 } });
    }
    const homeFeedPosts: PostData[] = await PostModel.aggregate([
      matchStage,
      ...sortingStages,
      { $unset: ["score"] },
      {
        $lookup: {
          from: "users",
          let: { postUserId: "$userId" },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$postUserId"] } } },
            { $project: { username: 1, imgUrl: 1 } },
          ],
          as: "userId",
        },
      },
      { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
      { $set: { userId: { $ifNull: ["$userId", null] } } },
    ]).exec();

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

  if (!postId || typeof postId !== "string") {
    return res.status(400).send("post-id is required and should not be an array");
  }

  const parsedBody = updatePostDataSchema.safeParse(req.body);

  if (parsedBody.success === false) {
    return res.status(400).send("invalid update data");
  }

  try {
    const postToUpdate = await PostModel.findById(postId);

    if (!postToUpdate) {
      return res.status(404).send("post not found");
    }

    if (postToUpdate.userId !== req.user?._id) {
      return res.status(403).send("not authorized");
    }

    postToUpdate.set(parsedBody.data);
    const updatedPost = await postToUpdate.save();

    // Trigger async embedding update if text was changed
    if (parsedBody.data.text) {
      checkAndUpdatePostEmbedding(postId).catch((error) => {
        console.error(`Failed to update embedding for post ${postId}:`, error);
      });
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).send("error updating post");
  }
};

const deletePost = async (req: AuthRequest, res: Response) => {
  const postId = req.params.postId;

  if (!postId || typeof postId !== "string") {
    return res.status(400).send("post-id is required and should not be an array");
  }

  try {
    const postToDelete = await PostModel.findById(postId);

    if (!postToDelete) {
      return res.status(404).send("post not found");
    }

    if (postToDelete.userId !== req.user?._id) {
      return res.status(403).send("not authorized");
    }

    const { deletedCount: postsDeletedCount } = await postToDelete.deleteOne();
    const { deletedCount: commentsDeletedCount } = await CommentModel.deleteMany({ postId });
    const { deletedCount: likesDeletedCount } = await LikeModel.deleteMany({ postId });

    // Clean up embedding data asynchronously
    PostEmbeddingModel.deleteOne({ postId }).catch((error) => {
      console.error(`Failed to delete embedding for post ${postId}:`, error);
    });

    res.status(200).json({ postsDeletedCount, commentsDeletedCount, likesDeletedCount });
  } catch (error) {
    console.error(error);
    res.status(500).send("error deleting post");
  }
};

const updateAllEmbeddings = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await updateAllPostEmbeddings();
    res.status(200).json({
      success: true,
      message: "Batch update completed",
      updated: result.updated,
      failed: result.failed,
    });
  } catch (error) {
    console.error("Error batch updating embeddings:", error);
    res.status(500).send("error batch updating embeddings");
  }
};

export default {
  createPost,
  getHomeFeedPosts,
  getLoggedInUserPosts,
  updatePost,
  deletePost,
  updateAllEmbeddings,
};
