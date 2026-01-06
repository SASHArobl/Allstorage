import { Schema, model, Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  telegram_id: number;
  username?: string;

  public_key: string;
  encrypted_private_key: string;

  created_at: Date;
}

const UserSchema = new Schema<IUser>({
  telegram_id: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },

  username: {
    type: String,
  },

  public_key: {
    type: String,
    required: true,
  },

  encrypted_private_key: {
    type: String,
    required: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel = model<IUser>("User", UserSchema);