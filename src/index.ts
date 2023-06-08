import express, { Request, Response } from "express";
import { User } from "./models/user";
import { Cart } from "./models/cart";
import { dbConnect } from "./database/connection";
import authenticate from "./authenticate";

const {
  validateUserSignUp,
  validateUserSignIn,
} = require("../middlewares/validation/user");
const { check, validationResult } = require("express-validator");

const app = express();
app.use(express.json());
dbConnect();
app.use((req: Request, res: Response, next) => {
  authenticate(req, res, next);
});

const test = async (email: string, password: string) => {
  const user = await User.findOne({ email: email });
  const result = await user.comparePassword(password);
  console.log("result is", result);
};

// Get list of all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    console.log(error);
  }
});

// test("hello15@gmail.com", "12341234");

// Add a user to DB
app.post("/users", validateUserSignUp, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;
  const isNewUser = await User.isThisEmailInUse(email);
  if (!isNewUser)
    return res.json({
      success: false,
      message: "This email is already in user try sign in",
    });
  try {
    // const { name, email, password, confirmpassword } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    return res.status(200).json({ message: "New account has been created" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/carts", async (req: Request, res: Response) => {
  try {
    const { itemname, description, price } = req.body;
    const cart = new Cart({ itemname, description, price });
    await cart.save();
    return res.status(200).json({ message: "cart has been added " });
  } catch (error) {
    console.log(error);
  }
});

app.delete("/users/:userId", async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete({ _id: req.params.userId });
    res.send("deleted");
  } catch (error) {
    console.log(error);
  }
});

app.get("/users/:userId", async (req: Request, res: Response) => {
  try {
    const IdUser = await User.findById(req.params.userId);
    res.send(IdUser);
  } catch (error) {
    console.log(error);
  }
});

app.put("/users/:userId", async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { info: "Hello fixed" });
    res.send("Updated!");
  } catch (error) {
    console.log(error);
  }
});

app.post(
  "/sign-in",
  validateUserSignIn,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.json({
        success: false,
        message: "user not found with the given email",
      });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.json({
        success: false,
        message: "user not found with the given email/password",
      });

    res.json({
      success: true,
      message: "You have successfully logged in",
      user: user,
    });
  }
);

app.listen(4000, () => {
  console.log("listening to port 4000");
});
