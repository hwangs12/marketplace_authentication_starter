import express, { Request, Response } from "express";
import { User } from "./models/user";
import { Cart } from "./models/cart";
import { dbConnect } from "./database/connection";
import authenticate from "./authenticate";
import { comparePassword } from "./utils/password";
import {
  validateUserSignIn,
  validateUserSignUp,
} from "./middlewares/validation/user";
import { validationResult } from "express-validator";
import crypto from "crypto";

const app = express();
app.use(express.json());
dbConnect();
// Add a user to DB
app.post("/users", validateUserSignUp, async (req: Request, res: Response) => {
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
});

app.post(
  "/sign-in",
  validateUserSignIn,
  async (req: Request, res: Response) => {
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

    console.log(user);

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
    console.log(user.password.substring(0, 19) + now.toString());
    let cipher = crypto.createCipheriv("aes-256-cbc", secret, iv);
    let encrypted = cipher.update(session_rule);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    res.set("user-token", encrypted.toString("hex") + iv.toString("hex"));
    res.json({
      success: true,
      message: `You have successfully logged in. Welcome ${user.name}`,
    });
  }
);

app.use((req: Request, res: Response, next) => {
  authenticate(req, res, next);
});

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

app.listen(4000, () => {
  console.log("listening to port 4000");
});
