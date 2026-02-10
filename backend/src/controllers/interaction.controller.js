// interaction.controller.js
const Like = require("../models/like.model");
const Comment = require("../models/comment.model");

exports.likePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { postId } = req.body;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!postId) return res.status(400).json({ message: "postId required" });

    await Like.addLike(postId, userId);
    const count = await Like.getLikeCount(postId);
    return res.json({ message: "Liked", like_count: count });
  } catch (err) {
    console.error("likePost error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { postId } = req.body;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!postId) return res.status(400).json({ message: "postId required" });

    await Like.removeLike(postId, userId);
    const count = await Like.getLikeCount(postId);
    return res.json({ message: "Unliked", like_count: count });
  } catch (err) {
    console.error("unlikePost error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

exports.commentPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { postId, text } = req.body;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!postId || !text || !text.trim()) {
      return res.status(400).json({ message: "postId and text required" });
    }

    const commentId = await Comment.addComment(postId, userId, text.trim());
    const comments = await Comment.getCommentsForPost(postId, 5);
    return res.status(201).json({ message: "Comment added", commentId, comments });
  } catch (err) {
    console.error("commentPost error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// const Like = require("../models/like.model");
// const Comment = require("../models/comment.model");

// // POST /api/posts/like  { postId }
// exports.likePost = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { postId } = req.body;
//     if (!postId) return res.status(400).json({ message: "postId required" });

//     await Like.addLike(postId, userId);
//     const count = await Like.getLikeCount(postId);
//     res.json({ message: "Liked", like_count: count });
//   } catch (err) {
//     console.error("likePost error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // POST /api/posts/unlike  { postId }
// exports.unlikePost = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { postId } = req.body;
//     if (!postId) return res.status(400).json({ message: "postId required" });

//     await Like.removeLike(postId, userId);
//     const count = await Like.getLikeCount(postId);
//     res.json({ message: "Unliked", like_count: count });
//   } catch (err) {
//     console.error("unlikePost error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // POST /api/posts/comment  { postId, text }
// exports.commentPost = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { postId, text } = req.body;
//     if (!postId || !text || text.trim() === "")
//       return res.status(400).json({ message: "postId and text required" });

//     const commentId = await Comment.addComment(postId, userId, text.trim());
//     const comments = await Comment.getCommentsForPost(postId, 5);
//     res.status(201).json({ message: "Comment added", commentId, comments });
//   } catch (err) {
//     console.error("commentPost error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
