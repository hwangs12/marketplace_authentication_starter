// const { User, IUser } = require("../models/user");

// const express = require("express");
// const router = express.Router();

// router.use(express.json());
// // Add a user to DB
// router.post("/users", async (req: Request, res: Response) => {
//   const { name, email, info } = req.body;
//   const isNewUser = await User.isThisEmailInUse(email);
//   if (!isNewUser)
//     return res.json({
//       success: false,
//       message: "This email is already in user try sign in",
//     });
//   try {
//     // const { name, email, info } = req.body;
//     const user = new User({ name, email, info });
//     await user.save();
//     return res.status(200).json({ message: "Hello world" });
//   } catch (error) {
//     console.log(error);
//   }
// });

// module.exports = router;
