import express from "express";
import { dbConnect } from "./database/connection";
import {
  validateUserSignIn,
  validateUserSignUp,
} from "./middlewares/validation/user";
import {
  registerUser,
  signInUser,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  authenticate,
} from "./controllers/userController";
import { errorHandler } from "./handlers/errorHandler";

const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.set("trust proxy", true);
dbConnect();
// Add a user to DB
app.post("/users", validateUserSignUp, registerUser);
app.post("/sign-in", validateUserSignIn, signInUser);
app.use(authenticate);
app.get("/users", getUsers);
app.delete("/users/:userId", deleteUser);
app.get("/users/:userId", getUser);
app.put("/users/:userId", updateUser);

app.use(errorHandler);

app.listen(4000, () => {
  console.log("listening to port 4000");
});
