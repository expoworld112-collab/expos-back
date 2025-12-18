import nc from "next-connect";
import connectDB from "../utils/db.js";
import { contactForm, contactBlogAuthorForm } from "../controllers/form.js";
import { runvalidation } from "../validators/index.js";
import { check } from "express-validator";

import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

// --------------------------
// Connect to MongoDB (if needed by forms)
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
const contactFormValidator = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Must be valid email address"),
  check("message")
    .not()
    .isEmpty()
    .isLength({ min: 20 })
    .withMessage("Message must be at least 20 characters long"),
];

// --------------------------
// Routes
// --------------------------
handler.post("/contact", contactFormValidator, runvalidation, contactForm);
handler.post(
  "/contacting-blog-author",
  contactFormValidator,
  runvalidation,
  contactBlogAuthorForm
);

export default handler;
