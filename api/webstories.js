import nc from "next-connect";
import connectDB from "../utils/db.js";
import {
  createWebStory,
  fetchWebStoryBySlug,
  allstories,
  deletestory,
  updateStory,
  sitemap,
  allslugs,
} from "../controllers/webstories.js";

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
// Routes
// --------------------------
handler.post("/webstory", requireSignin, adminMiddleware, createWebStory);
handler.get("/webstories/:slug", fetchWebStoryBySlug);
handler.get("/allwebstories", allstories);
handler.get("/allslugs", allslugs);
handler.get("/sitemap", sitemap);
handler.delete("/webstorydelete/:slug", requireSignin, adminMiddleware, deletestory);
handler.patch("/webstoriesupdate/:slug", requireSignin, adminMiddleware, updateStory);

export default handler;
