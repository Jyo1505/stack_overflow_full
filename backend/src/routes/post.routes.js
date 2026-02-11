// src/routes/post.routes.js
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const postController = require("../controllers/post.controller");
const interactionController = require("../controllers/interaction.controller");
const shareController = require("../controllers/share.controller");
const auth = require("../middlewares/auth.middleware");

// Ensure uploads folder exists (backend/uploads)
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Configure multer storage (define BEFORE creating upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .toLowerCase();
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  }
});

// Single file filter (images & videos only)
function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image/video files are allowed"), false);
  }
}

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max (adjust if needed)
});

// Routes
router.post("/create", auth, upload.single("media"), postController.createPost);
router.get("/all", auth, postController.getAllPosts);
router.get("/limit", auth, postController.getPostLimitInfo);

router.post("/like", auth, interactionController.likePost);
router.post("/unlike", auth, interactionController.unlikePost);
router.post("/comment", auth, interactionController.commentPost);

// share route (accepts { postId, targetId })
router.post("/share", auth, shareController.sharePost);

// delete post route (expects { postId } in body)
// router.delete("/delete", auth, postController.deletePost);

module.exports = router;
