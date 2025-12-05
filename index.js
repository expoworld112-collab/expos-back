// import express from "express";
// import morgan from "morgan";
// import bodyParser from "body-parser";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import mongoose from "mongoose";
// import blogRoutes from "./routes/blog.js";
// import authRoutes from "./routes/auth.js";
// import userRoutes from "./routes/user.js";
// import categoryRoutes from "./routes/category.js";
// import tagRoutes from "./routes/tag.js";
// import formRoutes from "./routes/form.js";
// import ImageRoutes from "./routes/images.js";
// import storyRoutes from "./routes/slides.js";
// import "dotenv/config.js";
// import session from "express-session";
// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth2";
// import User from "./models/user.js";
// import jwt from "jsonwebtoken";
// import { FRONTEND } from "./config.js";

// const app = express();

// /* ✅ FIX #1 — FULL CORS + OPTIONS SUPPORT */
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://expo-front-ggz4.vercel.app",
//   FRONTEND
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// app.options("*", cors());

// /* DB */
// mongoose.set("strictQuery", true);
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("DB connected"))
//   .catch((err) => console.log("DB Error => ", err));

// /* Middlewares */
// app.use(morgan("dev"));
// app.use(bodyParser.json());
// app.use(cookieParser());

// /* SESSION FIX — cannot use secure cookie on local or Vercel serverless */
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "secret123",
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       secure: false, // ❗ must be false on Vercel serverless
//       sameSite: "lax",
//       httpOnly: true,
//     },
//   })
// );

// /* PASSPORT */
// app.use(passport.initialize());
// app.use(passport.session());

// const clientid = process.env.GOOGLE_CLIENT_ID;
// const clientsecret = process.env.GOOGLE_CLIENT_SECRET;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: clientid,
//       clientSecret: clientsecret,
//       callbackURL: "/auth/google/callback",
//       scope: ["profile", "email"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne(
//           { email: profile.emails[0].value },
//           "email username name profile role"
//         );
//         return done(null, user);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));

// /* GOOGLE OAUTH ROUTES */
// app.get(
//   "/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", {
//     successRedirect: FRONTEND,
//     failureRedirect: `${FRONTEND}/signin`,
//   })
// );

// app.get("/login/success", async (req, res) => {
//   if (req.user) {
//     const token = jwt.sign({ _id: req.user._id }, "Div12@", {
//       expiresIn: "10d",
//     });
//     res.status(200).json({ user: req.user, token });
//   } else {
//     res.status(400).json({ message: "Not Authorized" });
//   }
// });

// app.get("/logout", (req, res, next) => {
//   req.logout(function (err) {
//     if (err) return next(err);
//     res.redirect(`${FRONTEND}/signin`);
//   });
// });

// /* API ROUTES */
// app.use("/api", blogRoutes);
// app.use("/api", authRoutes);
// app.use("/api", userRoutes);
// app.use("/api", categoryRoutes);
// app.use("/api", tagRoutes);
// app.use("/api", formRoutes);
// app.use("/api", ImageRoutes);
// app.use("/api", storyRoutes);

// /* BASE */
// app.get("/", (req, res) => {
//   res.json("Backend index");
// });

// /* ❗ FIX #2 — REMOVE app.listen FOR VERCEL */
// export default app;

import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import blogRoutes from "./routes/blog.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import categoryRoutes from "./routes/category.js";
import tagRoutes from "./routes/tag.js";
import formRoutes from "./routes/form.js";
import ImageRoutes from "./routes/images.js";
import storyRoutes from "./routes/slides.js";
import "dotenv/config.js";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import User from "./models/user.js";
import jwt from "jsonwebtoken";
import { FRONTEND } from "./config.js";

const app = express();

/* -------------------------------------------------
   ✅ FIX #1 — FULL CORS + PROPER PREFLIGHT SUPPORT
   ------------------------------------------------- */
const allowedOrigins = [
  "http://localhost:3000",
  "https://expo-front-ggz4.vercel.app",
  FRONTEND,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Required for CORS preflight
app.options("*", cors());

/* -------------------------------------------------
   ✅ MongoDB Connection
   ------------------------------------------------- */
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB Error => ", err));

/* -------------------------------------------------
   Middleware
   ------------------------------------------------- */
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

/* -------------------------------------------------
   ✅ FIX #2 — SESSION CONFIG FOR VERCEL
   Vercel CANNOT use secure cookies (secure: true)
   ------------------------------------------------- */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // ❗ MUST be false on Vercel serverless
      sameSite: "lax",
      httpOnly: true,
    },
  })
);

/* -------------------------------------------------
   Passport Setup
   ------------------------------------------------- */
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
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne(
          { email: profile.emails[0].value },
          "email username name profile role"
        );
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

/* -------------------------------------------------
   Google Auth Routes
   ------------------------------------------------- */
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: FRONTEND,
    failureRedirect: `${FRONTEND}/signin`,
  })
);

app.get("/login/success", async (req, res) => {
  if (req.user) {
    const token = jwt.sign({ _id: req.user._id }, "Div12@", {
      expiresIn: "10d",
    });
    return res.status(200).json({ user: req.user, token });
  }
  res.status(400).json({ message: "Not Authorized" });
});

app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect(`${FRONTEND}/signin`);
  });
});

/* -------------------------------------------------
   API Routes
   ------------------------------------------------- */
app.use("/api", blogRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", tagRoutes);
app.use("/api", formRoutes);
app.use("/api", ImageRoutes);
app.use("/api", storyRoutes);

app.get("/", (req, res) => {
  res.json("Backend index");
});

/* -------------------------------------------------
   ❗ FIX #3 — REQUIRED FOR VERCEL
   DO NOT USE app.listen() ON VERCEL
   ------------------------------------------------- */
export default app;
