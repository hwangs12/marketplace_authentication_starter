import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";
import { comparePassword } from "../utils/password";
import crypto from "crypto";
import {
  buf2hex,
  hex2ArrayBuffer,
  decrypt,
  encrypt,
  fromHexStringToUint8Array,
  finishDecipher,
} from "../utils/encryption";
import { AuthenticationError, ResourceNotFoundError } from "../errors";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    const user = new User({ name, email, password });
    await user.save();
    return res.status(200).json({ message: "New account has been created" });
  } catch (error) {
    next(error);
  }
};

export const signInUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne(
      { email },
      {
        _id: 0,
        name: 1,
        email: 1,
        password: 1,
        loggedIn: 1,
      }
    );
    console.log(`The current loggedin status is ${user?.loggedIn}`);
    // const { expirationTime, currentTime } = await authenticate(req, res, next);
    if (user && user.loggedIn == false) {
      console.log("Your loggedIn status is false. Let me create a new token");
    }
    if (user && user.loggedIn == true) {
      console.log(
        "Your token has not expired yet and You are already logged in"
      );
      return res.json({
        success: false,
        message:
          "Your token has not expired yet and You are already logged in.",
        UserloggedinStatus: user.loggedIn,
      });
      //if the loggedin status is true, it will return res.json and end the code here instead of proceeding to the below code.
    }
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
      "created": "${Date.now()}",
      "expiration": "${Date.now() + 36000}",
      "useremail": "${email}"
    }`;
    //3600000
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
    await User.findOneAndUpdate({ email }, { loggedIn: true });

    res.set("user-token", userToken);
    res.json({
      success: true,
      message: `You have successfully logged in. Welcome ${user.name}`,
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const authenticate = async (req: any, res: any, next: any) => {
  try {
    const userToken = req.headers["authorization"];
    const iv = Buffer.from(userToken.slice(-152, -120), "hex");
    const session_definition = userToken.slice(0, -152);

    const secretCipherText = hex2ArrayBuffer(userToken.slice(-120, -24));
    const secretIv = fromHexStringToUint8Array(userToken.slice(-24));
    const encryptedSecret = { cipherText: secretCipherText, iv: secretIv };
    const secret = await decrypt(encryptedSecret, req.ip);
    const textToDecipher = Buffer.from(session_definition, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", secret, iv);
    let decrypted = decipher.update(textToDecipher);
    decrypted = Buffer.concat([decrypted, finishDecipher(decipher)]);
    console.log(decrypted.toString());
    console.log(JSON.parse(decrypted.toString()).expiration);
    console.log(Date.now());
    const jsonedSession = JSON.parse(decrypted.toString());
    const expirationTime = jsonedSession.expiration;
    const currentTime = Date.now();
    if (currentTime > expirationTime) {
      console.log(
        "Your token has expired. Please sign in again. This message is from authenticate"
      );
      await User.findOneAndUpdate(
        { email: jsonedSession.useremail },
        { loggedIn: false }
      );
      throw new AuthenticationError(
        "Your token has expired. Please sign in again"
      );
    }

    // next();
    console.log(
      `Here is the expirationTime and currentTime ${expirationTime} ${currentTime}`
    );
    next();
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find({}).select({ password: false });
    res.send(users);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndDelete({ _id: req.params.userId });
    if (!user) {
      throw new ResourceNotFoundError("user does not exist");
    }
    return res
      .status(200)
      .json({ message: "user account deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw new ResourceNotFoundError("user does not exist");
    }
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, {
      info: "Hello fixed",
    });
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
