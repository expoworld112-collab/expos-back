import express from "express";
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import "dotenv/config.js";

import blogRoutes from "./routes/blog.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import categoryRoutes from "./routes/category.js";
import tagRoutes from "./routes/tag.js";
import formRoutes from "./routes/form.js";
import imageRoutes from "./routes/images.js";
import storyRoutes from "./routes/slides.js";

import User from "./models/user.js";

/* ---------------------------------------------------
   App
----------------------------------------------------- */
const app = express();
/* ---------------------------------------------------
   MongoDB Connection
----------------------------------------------------- */
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB connection error ❌", err));

  const FRONTEND = (process.env.FRONTEND || "https://expo-front-x8h5.vercel.app").replace(/\/+$/, "");
const BACKEND = (process.env.BACKEND_URL || "https://expos-back.vercel.app").replace(/\/+$/, "");


// const FRONTEND =
//   process.env.FRONTEND || "https://expo-front-x8h5.vercel.app";
// const BACKEND =
//   process.env.BACKEND_URL || "https://expos-back.vercel.app/";

// const FRONTEND =
//   process.env.FRONTEND || "https://localhost:3000";
// const BACKEND =
//   process.env.BACKEND_URL || "https://localhost:8000";

/* ---------------------------------------------------
   CORS (correct for cookies + OAuth)
----------------------------------------------------- */
app.use(
  cors({
    origin: FRONTEND,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ---------------------------------------------------
   Middleware
----------------------------------------------------- */
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

/* ---------------------------------------------------
   Session (REQUIRED for Vercel)
----------------------------------------------------- */
app.use(
  session({
    name: "session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: {
      httpOnly: true,
      secure: true,       // Vercel = HTTPS
      sameSite: "none",   // cross-site cookies
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
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
      callbackURL: `${BACKEND}/api/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            username: email.split("@")[0],
            profile: profile.photos[0]?.value,
            role: "user",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

/* ---------------------------------------------------
   Routes
----------------------------------------------------- */
app.use("/api", blogRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", tagRoutes);
app.use("/api", formRoutes);
app.use("/api", imageRoutes);
app.use("/api", storyRoutes);

app.get("/", (_, res) => res.json("Backend running ✅"));

/* ---------------------------------------------------
   Export (Vercel)
----------------------------------------------------- */
// At the very bottom of your file, before export (or in a separate local file):
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} ✅`);
});

export default app;
