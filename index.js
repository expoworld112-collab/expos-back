import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import "dotenv/config.js";

import blogRoutes from "./routes/blog.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import categoryRoutes from "./routes/category.js";
import tagRoutes from "./routes/tag.js";
import formRoutes from "./routes/form.js";
import ImageRoutes from "./routes/images.js";
import storyRoutes from "./routes/slides.js";

import User from "./models/user.js";
import { FRONTEND } from "./config.js";

const app = express();

/* ---------------------------------------------------
   ✅ FIXED CORS — ALWAYS APPLIED (even on Vercel)
----------------------------------------------------- */
const allowedOrigin = process.env.FRONTEND || "https://expo-front-ggz4.vercel.app";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

/* ---------------------------------------------------
   Middleware
----------------------------------------------------- */
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

/* ---------------------------------------------------
   Session (works on Vercel)
----------------------------------------------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // MUST BE FALSE ON VERCEL
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

/* ---------------------------------------------------
   Passport
----------------------------------------------------- */
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (_, __, profile, done) => {
      try {
        const user = await User.findOne(
          { email: profile.emails[0].value },
          "email username name profile role"
        );
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

/* ---------------------------------------------------
   Routes
----------------------------------------------------- */
app.use("/api", blogRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", tagRoutes);
app.use("/api", formRoutes);
app.use("/api", ImageRoutes);
app.use("/api", storyRoutes);

app.get("/", (req, res) => res.json("Backend index"));

/* ---------------------------------------------------
   Required for Vercel
----------------------------------------------------- */
export default app;
