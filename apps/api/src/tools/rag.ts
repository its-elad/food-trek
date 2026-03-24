import { env } from "../env.js";
import { AnyBulkWriteOperation, PipelineStage, Types } from "mongoose";
import PostModel from "../models/post.model.js";
import PostEmbeddingModel from "../models/postEmbedding.model.js";
import { PostData } from "@food-trek/schemas";

const SIMILARITY_THRESHOLD = 0.3;

const BATCH_SIZE = 20;

type EmbeddingResponse = {
  data?: Array<{ embedding: number[]; index: number }>;
};

type PostNeedingEmbeddingUpdate = {
  _id: Types.ObjectId;
  text: string;
};

const fetchEmbeddings = async (input: string | string[]): Promise<number[][]> => {
  const response = await fetch(`${env.OPENROUTER_URL}/api/v1/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: env.OPENROUTER_EMBEDDING_MODEL, input }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as EmbeddingResponse;

  if (!data.data?.length) {
    throw new Error("Invalid embedding response from OpenRouter");
  }

  return data.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
};

export const getTextEmbedding = async (text: string): Promise<number[]> => {
  try {
    const results = await fetchEmbeddings(text);
    const embedding = results[0];
    if (!embedding) throw new Error("Empty embedding returned");
    return embedding;
  } catch (error) {
    console.error("Error fetching embedding from OpenRouter:", error);
    throw error;
  }
};

const cosineSimilarity = (vec1: number[], vec2: number[]): number => {
  if (vec1.length !== vec2.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    const v1i = vec1[i];
    const v2i = vec2[i];
    if (v1i !== undefined && v2i !== undefined) {
      dotProduct += v1i * v2i;
      norm1 += v1i * v1i;
      norm2 += v2i * v2i;
    }
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dotProduct / (norm1 * norm2);
};

export const searchPostsBySemanticSimilarity = async (
  query: string,
  filterByUserId?: { userId: string; equals: boolean }
): Promise<(PostData & { similarity: number })[]> => {
  const queryEmbedding = await getTextEmbedding(query);

  const postEmbeddings: { embedding: number[]; post: PostData }[] = await PostEmbeddingModel.aggregate([
    {
      $lookup: {
        from: "posts",
        localField: "postId",
        foreignField: "_id",
        as: "post",
      },
    },
    {
      $unwind: {
        path: "$post",
        preserveNullAndEmptyArrays: true,
      },
    },
    ...(filterByUserId
      ? [{ $match: { "post.userId": { [filterByUserId.equals ? "$eq" : "$ne"]: filterByUserId.userId } } }]
      : []),
    {
      $lookup: {
        from: "users",
        let: { postUserId: "$post.userId" },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$postUserId"] } } },
          { $project: { username: 1, imgUrl: 1 } },
        ],
        as: "post.userId",
      },
    },
    { $unwind: { path: "$post.userId", preserveNullAndEmptyArrays: true } },
    { $set: { "post.userId": { $ifNull: ["$post.userId", null] } } },
    {
      $project: {
        _id: 0,
        embedding: 1,
        post: 1,
      },
    },
  ]);

  if (postEmbeddings.length === 0) {
    return [];
  }

  const results = postEmbeddings
    .map((embeddingDoc) => {
      const similarity = cosineSimilarity(queryEmbedding, embeddingDoc.embedding);

      return {
        ...embeddingDoc.post,
        similarity,
      };
    })
    .filter((result) => result.similarity >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity);

  return results;
};

const findPostsNeedingEmbeddingUpdate = async (
  postMatch: PipelineStage.Match["$match"] = {}
): Promise<PostNeedingEmbeddingUpdate[]> => {
  const pipeline: PipelineStage[] = [];

  if (Object.keys(postMatch).length > 0) {
    pipeline.push({ $match: postMatch });
  }

  pipeline.push(
    {
      $lookup: {
        from: "postembeddings",
        localField: "_id",
        foreignField: "postId",
        as: "embedding",
      },
    },
    { $unwind: { path: "$embedding", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { embedding: null },
          { $expr: { $gt: ["$updatedAt", "$embedding.lastUpdated"] } },
          { "embedding.embeddingModel": { $ne: env.OPENROUTER_EMBEDDING_MODEL } },
        ],
      },
    },
    { $project: { _id: 1, text: 1 } }
  );

  return await PostModel.aggregate<PostNeedingEmbeddingUpdate>(pipeline);
};

const upsertPostEmbeddings = async (
  posts: PostNeedingEmbeddingUpdate[],
  options?: { throwOnBatchError?: boolean }
): Promise<{ updated: number; failed: number }> => {
  if (posts.length === 0) return { updated: 0, failed: 0 };

  let updated = 0;
  let failed = 0;
  const now = new Date();

  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);

    try {
      const embeddings = await fetchEmbeddings(batch.map((p) => p.text));

      const bulkOps = batch.map((post, idx) => {
        const embedding = embeddings[idx];
        if (!embedding) throw new Error(`Missing embedding at index ${idx}`);
        return {
          updateOne: {
            filter: { postId: post._id },
            update: {
              $set: {
                postId: post._id,
                embedding,
                embeddingModel: env.OPENROUTER_EMBEDDING_MODEL,
                lastUpdated: now,
              },
            },
            upsert: true,
          },
        } satisfies AnyBulkWriteOperation<typeof PostEmbeddingModel>;
      });

      const writeResult = await PostEmbeddingModel.bulkWrite(bulkOps, { ordered: false });
      updated += writeResult.modifiedCount + writeResult.upsertedCount;
      failed += writeResult.getWriteErrorCount();
    } catch (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} has failed:`, error);
      failed += batch.length;

      if (options?.throwOnBatchError) {
        throw error;
      }
    }
  }

  console.log(`Embedding update completed: ${updated} updated, ${failed} failed`);
  return { updated, failed };
};

export const checkAndUpdatePostEmbedding = async (postId: string): Promise<boolean> => {
  const postObjectId = new Types.ObjectId(postId);
  try {
    const stalePosts = await findPostsNeedingEmbeddingUpdate({ _id: postObjectId });

    if (stalePosts.length === 0) {
      const postExists = await PostModel.exists({ _id: postObjectId });
      if (!postExists) {
        console.warn(`Post with ID ${postId} not found`);
      }
      return false;
    }

    const result = await upsertPostEmbeddings(stalePosts, { throwOnBatchError: true });
    return result.updated > 0;
  } catch (error) {
    console.error(`Error checking/updating embedding for post ${postId}:`, error);
    throw error;
  }
};

export const updateAllPostEmbeddings = async (): Promise<{ updated: number; failed: number }> => {
  const stalePosts = await findPostsNeedingEmbeddingUpdate();
  return upsertPostEmbeddings(stalePosts);
};
