// backend/src/app.js

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ================== MIDDLEWARE ==================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================== STATIC FILES ==================
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

// ================== ROUTES (REQUIRE FIRST) ==================
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const friendRoutes = require("./routes/friend.routes");
const postRoutes = require("./routes/post.routes");
const passwordRoutes = require("./routes/password.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const questionRoutes = require("./routes/question.routes");


// ================== ROUTE USAGE ==================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", require("./routes/answer.routes"));
app.use("/api/points", require("./routes/points.routes"));

// ================== TEST ROUTES ==================
app.get("/api", (req, res) => {
  res.send("Backend API is running ✅");
});

// ================== DEFAULT FRONTEND ==================
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/index.html")
  );
});

module.exports = app;
