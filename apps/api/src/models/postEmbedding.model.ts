import { Schema, model } from "mongoose";

const postEmbeddingSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, unique: true, index: true },
    embedding: { type: [Number], required: true },
    embeddingModel: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const PostEmbeddingModel = model("PostEmbedding", postEmbeddingSchema);

export default PostEmbeddingModel;
