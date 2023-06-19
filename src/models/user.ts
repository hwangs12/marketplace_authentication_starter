import { Schema, model, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  name: string;
  email: string;
  password: string;
  // confirmpassword: string;
}

interface IUserModel extends Model<IUser> {
  isThisEmailInUse(email: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  // confirmpassword: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  const hash = await bcrypt.hash(this.password, 8);
  this.password = hash;
  next();
});

//email/pw > encrypt to hash, user email/pw in RN and encrypt > send to auth  > decrypt > compare
userSchema.statics.isThisEmailInUse = async function (email: string) {
  if (!email) throw new Error("Invalid Email");
  try {
    const user = await this.findOne({ email: email });
    if (user) return true;
    return false;
  } catch (error: any) {
    console.log("error inside isThisEmailInUse method", error.message);
    throw new Error("userDbStaticFnError");
  }
};

export const User = model<IUser, IUserModel>("User", userSchema);
