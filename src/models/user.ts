import { Schema, model, Model } from "mongoose";
const bcrypt = require("bcrypt");

interface IUser {
  name: string;
  email: string;
  password: string;
  confirmpassword: String;
  comparePassword(password: string): Promise<boolean>;
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

userSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isModified("email")) {
    if (this.isModified("password")) {
      bcrypt.hash(this.password, 8, (err, hash) => {
        if (err) return next(err);
        this.password = hash;
        // bcrypt.hash(this.confirmpassword, 8, (err, hash) => {
        //   if (err) return next(err);
        //   this.confirmpassword = hash;
        if (this.isModified("email")) {
          bcrypt.hash(this.email, 8, (err, hash) => {
            if (err) return next(err);
            this.email = hash;
            next();
          });
        } else {
          next();
        }
      });
    } else {
      bcrypt.hash(this.email, 8, (err, hash) => {
        if (err) return next(err);
        this.email = hash;
        next();
      });
    }
  } else {
    next();
  }
});

//email/pw > encrypt to hash, user email/pw in RN and encrypt > send to auth  > decrypt > compare
userSchema.methods.comparePassword = async function (password) {
  if (!password) throw new Error("Password is missing");

  try {
    const result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error: any) {
    console.log("Error while compaing password", error.message);
  }
};

userSchema.statics.isThisEmailInUse = async function (email: string) {
  if (!email) throw new Error("Invalid Email");
  try {
    const user = await this.findOne({ email: email });
    if (user) return false;
    return true;
  } catch (error: any) {
    console.log("error inside isThisEmailInUse method", error.message);
    return false;
  }
};

export const User = model<IUser, IUserModel>("User", userSchema);
