import { check } from "express-validator";

export const validateUserSignUp = [
  check("name")
    .trim()
    .not()
    .isEmpty()
    .isLength({ min: 3, max: 20 })
    .withMessage("Name must be within 3 to 20 characters"),
  check("email").normalizeEmail().isEmail().withMessage("Invalid email"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be within 8 to 20 characters"),
  check("confirmpassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Both passwords must be the same");
    }
    return true;
  }),
];

export const validateUserSignIn = [
  check("email").trim().isEmail().withMessage("Email and password required"),
  check("password").trim().not().isEmpty().withMessage("Password required"),
];
