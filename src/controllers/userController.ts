import { validationResult } from "express-validator";
import { Request, Response } from "express";
import { User } from "../models/user";
import { comparePassword } from "../utils/password";
import crypto from "crypto";
import {
  buf2hex,
  hex2ArrayBuffer,
  decrypt,
  encrypt,
  fromHexStringToUint8Array,
} from "../utils/encryption";

export const registerUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  const emailExistsInDB = await User.isThisEmailInUse(email);
  if (emailExistsInDB)
    return res.json({
      success: false,
      message: "This email is already in use.",
    });
  try {
    // const { name, email, password, confirmpassword } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    return res.status(200).json({ message: "New account has been created" });
  } catch (error) {
    console.log(error);
  }
};

export const signInUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne(
    { email },
    {
      _id: 0,
      name: 1,
      email: 1,
      password: 1,
    }
  );

  if (!user)
    return res.json({
      success: false,
      message: "invalid login",
    });

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch)
    return res.json({
      success: false,
      message: "invalid login",
    });
  // the token should have information about created time, expiration time, user email (all encrypted)
  const session_rule = `{
    created: ${Date.now()},
    expiration: ${Date.now() + 3600000},
    useremail: ${email},
  }`;
  let iv = Buffer.from(user.password.substring(32, 48));
  let now = Date.now();
  let secret = Buffer.from(user.password.substring(0, 19) + now.toString());
  let secretEncrypted = await encrypt(
    user.password.substring(0, 19) + now.toString(),
    req.ip
  );
  const cipherText = buf2hex(secretEncrypted.cipherText);
  const cipherIv = buf2hex(secretEncrypted.iv);

  let cipher = crypto.createCipheriv("aes-256-cbc", secret, iv);
  let encrypted = cipher.update(session_rule);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const userToken =
    encrypted.toString("hex") + iv.toString("hex") + cipherText + cipherIv;
  res.set("user-token", userToken);
  res.json({
    success: true,
    message: `You have successfully logged in. Welcome ${user.name}`,
  });
};

export const authenticate = async (req: any, res: any, next: any) => {
  const userToken = req.headers["authorization"];
  const iv = Buffer.from(userToken.slice(-152, -120), "hex");
  const session_definition = userToken.slice(0, -152);
  const secretCipherText = hex2ArrayBuffer(userToken.slice(-120, -24));
  const secretIv = fromHexStringToUint8Array(userToken.slice(-24));
  const encryptedSecret = { cipherText: secretCipherText, iv: secretIv };
  let secret = await decrypt(encryptedSecret, req.ip);
  let textToDecipher = Buffer.from(session_definition, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", secret, iv);

  let decrypted = decipher.update(textToDecipher);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  next();
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    console.log(error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete({ _id: req.params.userId });
    res.send("deleted");
  } catch (error) {
    console.log(error);
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const IdUser = await User.findById(req.params.userId);
    res.send(IdUser);
  } catch (error) {
    console.log(error);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { info: "Hello fixed" });
    res.send("Updated!");
  } catch (error) {
    console.log(error);
  }
};
