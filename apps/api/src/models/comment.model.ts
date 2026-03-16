import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    userId: { type: String, ref: "User", required: true },
    postId: { type: String, ref: "post", required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const CommentModel = model("comment", commentSchema);

export default CommentModel;
