import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  profileImage?: string;
  refreshTokens: string[];
}

const userSchema = new Schema<IUser>({
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
  profileImage: {
    type: String,
  },
  refreshTokens: {
    type: [String],
    default: [],
  },
});

export default mongoose.model<IUser>('User', userSchema);
