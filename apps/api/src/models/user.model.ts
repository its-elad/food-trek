import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    // not required – Google-only users won't have a password
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  imgUrl: {
    type: String,
  },
  refreshTokens: {
    type: [String],
    default: [],
  },
});

export const User = mongoose.model("User", userSchema);
