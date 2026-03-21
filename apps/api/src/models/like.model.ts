import { Schema, model } from "mongoose";

const likeSchema = new Schema(
  {
    userId: { type: String, ref: "User", required: true },
    postId: { type: String, ref: "Post", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const LikeModel = model("Like", likeSchema);

export default LikeModel;
