import nc from "next-connect";
import connectDB from "../utils/db.js";
import { create, list, read, remove } from "../controllers/tag.js";
import { runvalidation } from "../validators/index.js";
import { check } from "express-validator";
import { requireSignin, adminMiddleware } from "../controllers/auth.js";

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
const createTagValidator = [
  check("name").not().isEmpty().withMessage("Name is required"),
];

// --------------------------
// Routes
// --------------------------
handler.post("/tag", createTagValidator, runvalidation, requireSignin, adminMiddleware, create);
handler.get("/tags", list);
handler.get("/tag/:slug", read);
handler.delete("/tag/:slug", requireSignin, adminMiddleware, remove);

export default handler;
