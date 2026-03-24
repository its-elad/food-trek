import {
  getCurrentTimeServerDef,
  PostData,
  SearchPostsInput,
  SearchPostsOutput,
  searchPostsServerDef,
} from "@food-trek/schemas";
import PostModel from "../models/post.model.js";
import { ObjectId } from "mongoose";
import { encode } from "@toon-format/toon";

export const getCurrentTime = getCurrentTimeServerDef.server(async () => {
  const now = new Date();
  return {
    iso: now.toISOString(),
    date: now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
});

const searchPostsFunc = async ({ query, limit }: SearchPostsInput): Promise<SearchPostsOutput> => {
  const normalizedQuery = query.toLowerCase().replace(/\s+/g, " ").trim();

  const matches: {
    _id: ObjectId;
    text: string;
    imageUrl: string;
    createdAt: Date | string;
    score?: number;
    author: {
      _id: string;
      username: string;
      imgUrl: string;
    };
  }[] = await PostModel.aggregate([
    { $match: { $text: { $search: normalizedQuery } } },
    { $addFields: { score: { $meta: "textScore" } } },
    {
      $lookup: {
        from: "users",
        let: { postUserId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [{ $eq: ["$_id", { $toObjectId: "$$postUserId" }] }],
              },
            },
          },
          {
            $project: {
              _id: 1,
              username: 1,
              imgUrl: 1,
            },
          },
        ],
        as: "authorDoc",
      },
    },
    {
      $addFields: {
        authorDoc: { $arrayElemAt: ["$authorDoc", 0] },
      },
    },
    { $sort: { score: -1, createdAt: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        text: 1,
        imageUrl: 1,
        createdAt: 1,
        score: 1,
        author: {
          _id: {
            $ifNull: [{ $toString: "$authorDoc._id" }, "$userId"],
          },
          username: {
            $ifNull: ["$authorDoc.username", "--unknown--"],
          },
          imgUrl: {
            $ifNull: ["$authorDoc.imgUrl", ""],
          },
        },
      },
    },
  ]).exec();

  const data = encode(
    matches.map<Omit<PostData, "createdAt"> & { score: number; createdAt: string }>((post) => ({
      _id: String(post._id),
      text: post.text,
      imageUrl: post.imageUrl,
      createdAt: new Date(post.createdAt).toString(),
      userId: post.author,
      score: post.score ?? 0,
    }))
  );
  return { posts: data };
};

export const searchPosts = searchPostsServerDef.server((args) => searchPostsFunc(args as SearchPostsInput));
