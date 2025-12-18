import nc from "next-connect";
import connectDB from "../utils/db.js";
import Images from "../models/images.js";
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
// Controllers
// --------------------------
const uploadimages = async (req, res) => {
  try {
    const { url } = req.body;
    const images = new Images({ url });
    const data = await images.save();
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: "Something went wrong" });
  }
};

const allimages = async (req, res) => {
  try {
    const totalCount = await Images.countDocuments({}).exec();
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const skip = (page - 1) * perPage;
    const data = await Images.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .exec();
    res.json({ totalImages: totalCount, data });
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  try {
    const { url } = req.query;
    if (url) {
      const deletedImage = await Images.findOneAndDelete({ url }).exec();
      if (deletedImage) {
        res.json({ message: "Image deleted successfully" });
      } else {
        res.status(404).json({ error: "Image Cannot be found or deleted" });
      }
    } else {
      res.status(400).json({ error: "URL parameter is required" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cannot delete image" });
  }
};

// --------------------------
// Routes
// --------------------------
handler.post("/uploadimages", requireSignin, adminMiddleware, uploadimages);
handler.get("/allimages", allimages);
handler.delete("/images", remove); // URL passed as query param: ?url=<image_url>

export default handler;
