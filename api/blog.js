import nc from "next-connect";
import connectDB from "../utils/db.js";
import {
  create,
  list,
  list2,
  listAllBlogsCategoriesTags,
  read,
  remove,
  update,
  relatedposts,
  listSearch,
  listByUser,
  allblogs,
  feeds,
  allblogslugs,
} from "../controllers/blog.js";

import {
  requireSignin,
  adminMiddleware,
  authMiddleware,
  canUpdateDeleteBlog,
} from "../controllers/auth.js";

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

// Admin blog routes
handler.post("/blog", requireSignin, adminMiddleware, create);
handler.get("/blogs", list);
handler.get("/allblogs", allblogs);
handler.get("/rss", feeds);
handler.get("/blogs/search", listSearch);
handler.get("/blogs-categories-tags", listAllBlogsCategoriesTags);
handler.get("/blog/:slug", read);
handler.delete("/blog/:slug", requireSignin, adminMiddleware, remove);
handler.patch("/blog/:slug", requireSignin, adminMiddleware, update);
handler.get("/blog/related/:slug", relatedposts);
handler.get("/allblogslugs", allblogslugs);

// User blog routes
handler.get("/:username/userblogs", list2);
handler.post("/user/blog", requireSignin, authMiddleware, create);
handler.get("/:username/blogs", listByUser);
handler.delete("/user/blog/:slug", requireSignin, authMiddleware, canUpdateDeleteBlog, remove);
handler.patch("/user/blog/:slug", requireSignin, authMiddleware, canUpdateDeleteBlog, update);

export default handler;
