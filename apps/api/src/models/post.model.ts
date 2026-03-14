import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    userId: { type: String, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const PostModel = model("post", postSchema);

export default PostModel;
