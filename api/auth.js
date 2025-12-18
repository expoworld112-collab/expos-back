import nc from "next-connect";
import connectDB from "../utils/db.js";
import {
  signup,
  signin,
  signout,
  preSignup,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.js";

import { runvalidation } from "../validators/index.js";
import { check } from "express-validator";

import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

// --------------------------
// MongoDB connection
// --------------------------
connectDB();

// --------------------------
// Create handler
// --------------------------
const handler = nc();

// --------------------------
// Middleware
// --------------------------
handler.use(cors({ origin: process.env.FRONTEND, credentials: true }));
handler.use(bodyParser.json());
handler.use(cookieParser());

// --------------------------
// Validators
// --------------------------
const usersignupvalidator = [
  check("name")
    .isLength({ min: 5 })
    .withMessage("Name of more than 5 characters is required"),
  check("username")
    .isLength({ min: 3, max: 10 })
    .withMessage("Username of more than 3 and less than 11 characters is required"),
  check("email").isEmail().withMessage("Must be a valid email address"),
  check(
    "password",
    "The password must contain at least 1 lowercase, 1 uppercase, 1 numeric,1 special character (!@#$%^&*]) and must be 8 characters or longer."
  ).matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})"),
];

const resetPasswordValidator = [
  check(
    "newPassword",
    "The password must contain at least 1 lowercase, 1 uppercase, 1 numeric,1 special character (!@#$%^&*]) and must be 8 characters or longer."
  ).matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})"),
];

const usersigninvalidator = [
  check("email").isEmail().withMessage("Must be a valid email address"),
];

const forgotPasswordValidator = [
  check("email").not().isEmpty().isEmail().withMessage("Must be a valid email address"),
];

// --------------------------
// Routes
// --------------------------
handler.post("/pre-signup", usersignupvalidator, runvalidation, preSignup);
handler.post("/signup", signup);
handler.post("/signin", usersigninvalidator, runvalidation, signin);
handler.get("/signout", signout);

handler.put("/forgot-password", forgotPasswordValidator, runvalidation, forgotPassword);
handler.put("/reset-password", resetPasswordValidator, runvalidation, resetPassword);

// handler.post("/google-login", googleLogin);

export default handler;
