import express, { Request, Response } from "express";
import { User } from "./models/user";
import { dbConnect } from "./database/connection";
const app = express();
app.use(express.json());
dbConnect();
app.use("/validate", async (req, res) => {});

// Get list of all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    console.log(error);
  }
});

// Add a user to DB
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { info } = req.body;
    const user = new User({ info });
    await user.save();
    return res.status(200).json({ message: "ok" });
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

app.listen(4000, () => {
  console.log("listening to port 4000");
});
