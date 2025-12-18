import nc from "next-connect";
import connectDB from "../utils/db.js";
import { create, list, read, remove } from "../controllers/category.js";
import { runvalidation } from "../validators/index.js";
import { requireSignin, adminMiddleware } from "../controllers/auth.js";
import { check } from "express-validator";

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
const categoryCreateValidator = [
  check("name").not().isEmpty().withMessage("Name is required"),
];

// --------------------------
// Routes
// --------------------------
handler.post(
  "/category",
  categoryCreateValidator,
  runvalidation,
  requireSignin,
  adminMiddleware,
  create
);

handler.get("/categories", list);
handler.get("/category/:slug", read);
handler.delete("/category/:slug", requireSignin, adminMiddleware, remove);

export default handler;
