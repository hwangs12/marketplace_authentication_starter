import { Schema, model } from "mongoose";

interface IUser {
  info: string;
}

const userSchema = new Schema<IUser>({
  info: { type: String, required: true },
});

export const User = model<IUser>("User", userSchema);
