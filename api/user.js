// pages/api/user.js
import nc from "next-connect";
import connectDB from "../../utils/db.js"; // adjust path if needed
import { read, publicProfile, update, photo } from "../../controllers/user.js";
import { requireSignin, authMiddleware, adminMiddleware } from "../../controllers/auth.js";
import { check } from "express-validator";
import { runvalidation } from "../../validators/index.js";

import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

// --------------------------
// Connect to MongoDB
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
const updateUserValidator = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Valid email is required"),
];

// --------------------------
// Routes
// --------------------------

// Get logged-in user's profile (Private)
handler.get("/profile", requireSignin, authMiddleware, read);

// Get public profile by username (Public)
handler.get("/:username", publicProfile);

// Update user profile (Private)
handler.put(
  "/update",
  requireSignin,
  authMiddleware,
  updateUserValidator,
  runvalidation,
  update
);

// Get user's profile photo by username (Public)
handler.get("/photo/:username", photo);

// Example admin route: list all users (Admin only)
// handler.get("/", requireSignin, adminMiddleware, listAllUsers);

export default handler;

