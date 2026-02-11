// // POST /api/posts/create

// const Post = require("../models/post.model");
// const Friend = require("../models/friend.model");
// const db = require("../config/db");
// const Comment = require("../models/comment.model");
// const Like = require("../models/like.model");

// // Helper: compute allowed posts based on friendCount
// function getAllowedPostsPerDay(friendCount) {
//   if (friendCount === 0) return 0;
//   if (friendCount <= 10) return friendCount;
//   return Infinity; // unlimited
// }

// // POST /api/posts/create
// // POST /api/posts/create
// exports.createPost = async (req, res) => {
//   try {
//     const userId = req.user && req.user.id;
//     if (!userId) return res.status(401).json({ message: "Not authenticated" });

//     const content_text = (req.body && req.body.content_text) ? String(req.body.content_text).trim() : "";

//     // quick validation
//     if (!content_text) return res.status(400).json({ message: "Post content is required" });

//     // detect file uploaded by multer
//     let media_url = null;
//     let media_type = "none";
//     if (req.file) {
//       console.log("createPost: received file", req.file.filename, req.file.mimetype);
//       // assuming you serve uploads with app.use('/uploads', express.static(...))
//       media_url = `/uploads/${req.file.filename}`;
//       if (req.file.mimetype.startsWith("image/")) media_type = "image";
//       else if (req.file.mimetype.startsWith("video/")) media_type = "video";
//       else media_type = "file";
//     } else if (req.body.media_url) {
//       media_url = req.body.media_url;
//       media_type = "link";
//     }

//     // check post limits (re-using your existing helper)
//     const friendCount = await Friend.getFriendCount(userId);
//     const allowed = getAllowedPostsPerDay(friendCount);
//     if (allowed === 0) return res.status(403).json({ message: "You need at least 1 friend to post." });

//     const todayCount = await Post.getTodayPostCount(userId);
//     if (todayCount >= allowed) return res.status(403).json({ message: `Post limit reached.` });

//     // create post
//     const postId = await Post.createPost(userId, content_text, media_url, media_type);

//     return res.status(201).json({ message: "Post created", postId, media_url });
//   } catch (err) {
//     console.error("createPost error:", err);
//     if (err && err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ message: "File too large" });
//     return res.status(500).json({ message: "Server error", detail: String(err) });
//   }
// };
// exports.deletePost = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { postId } = req.body || req.query || {};
//     if (!postId) return res.status(400).json({ message: "postId required" });

//     // fetch post (Post.findById) and ensure author matches
//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ message: "Post not found" });
//     if (post.user_id !== userId) return res.status(403).json({ message: "Not allowed" });

//     // delete DB record and optionally remove file from disk
//     await Post.deleteById(postId); // implement in model
//     // if post.media_url points to /uploads/<file>, remove file
//     if (post.media_url && post.media_url.startsWith("/uploads/")) {
//       const fs = require('fs');
//       const path = require('path');
//       const filePath = path.join(__dirname, '..', '..', post.media_url);
//       fs.unlink(filePath, err => { if (err) console.warn('file delete error',err); });
//     }

//     return res.json({ message: "Post deleted" });
//   } catch (err) {
//     console.error("deletePost error", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ⭐ UPDATED GET /api/posts/all
// // GET /api/posts/all
// // GET /api/posts/all
// // GET /api/posts/all
// exports.getAllPosts = async (req, res) => {
//   try {
//     const currentUserId = req.user.id;

//     // get friend ids array (ensure it returns array)
//     let friendIds = [];
//     if (typeof Friend.getFriendIds === "function") {
//       friendIds = await Friend.getFriendIds(currentUserId) || [];
//     } else if (typeof Friend.getFriends === "function") {
//       // fallback: if only getFriends exists, map to ids
//       const f = await Friend.getFriends(currentUserId);
//       friendIds = (f || []).map(x => x.id);
//     }

//     const allowedIds = Array.from(new Set([currentUserId, ...friendIds]));

//     // Build placeholders for allowedIds
//     const placeholders = allowedIds.map(() => "?").join(",") || "?";
//     const paramsForPosts = [currentUserId, ...allowedIds]; // currentUserId used for liked_by_me subquery

//     // Query 1: real posts by allowed users
//     const postsSql = `
//       SELECT
//         p.id,
//         p.user_id AS author_id,
//         u.name AS user_name,
//         p.content_text,
//         p.media_url,
//         p.media_type,
//         p.created_at,
//         (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
//         (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
//         (SELECT COUNT(*) FROM shares s WHERE s.post_id = p.id) AS share_count,
//         (SELECT COUNT(*) FROM likes l2 WHERE l2.post_id = p.id AND l2.user_id = ?) AS liked_by_me
//       FROM posts p
//       JOIN users u ON p.user_id = u.id
//       WHERE p.user_id IN (${placeholders})
//       ORDER BY p.created_at DESC
//     `;
//     const [postsRows] = await db.query(postsSql, paramsForPosts);

//     // Query 2: shared_posts that appear on feeds of allowed users
//     const paramsForShared = [currentUserId, ...allowedIds];
//     const sharedSql = `
//       SELECT
//         sp.id AS shared_id,
//         sp.original_post_id,
//         sp.shared_by,
//         sp.owner_user_id,
//         sp.created_at AS shared_created_at,
//         op.user_id AS author_id,
//         u2.name AS user_name,
//         op.content_text,
//         op.media_url,
//         op.media_type,
//         (SELECT COUNT(*) FROM likes l WHERE l.post_id = op.id) AS like_count,
//         (SELECT COUNT(*) FROM comments c WHERE c.post_id = op.id) AS comment_count,
//         (SELECT COUNT(*) FROM shares s WHERE s.post_id = op.id) AS share_count,
//         (SELECT COUNT(*) FROM likes l2 WHERE l2.post_id = op.id AND l2.user_id = ?) AS liked_by_me
//       FROM shared_posts sp
//       JOIN posts op ON sp.original_post_id = op.id
//       JOIN users u2 ON op.user_id = u2.id
//       WHERE sp.owner_user_id IN (${placeholders})
//       ORDER BY sp.created_at DESC
//     `;
//     const [sharedRows] = await db.query(sharedSql, paramsForShared);

//     // Normalize results: convert each to unified shape
//     const normalized = [];

//     for (const r of postsRows) {
//       normalized.push({
//         id: r.id,
//         is_shared: false,
//         shared_id: null,
//         original_post_id: r.id,
//         author_id: r.author_id,
//         user_name: r.user_name,
//         content_text: r.content_text,
//         media_url: r.media_url,
//         media_type: r.media_type,
//         created_at: r.created_at,
//         like_count: Number(r.like_count || 0),
//         comment_count: Number(r.comment_count || 0),
//         share_count: Number(r.share_count || 0),
//         liked_by_me: !!r.liked_by_me,
//         comments: [] // will populate below
//       });
//     }

//     for (const s of sharedRows) {
//       normalized.push({
//         id: s.original_post_id,          // for comments/likes we refer to original post id
//         is_shared: true,
//         shared_id: s.shared_id,
//         original_post_id: s.original_post_id,
//         shared_by: s.shared_by,
//         shared_owner_id: s.owner_user_id,
//         shared_created_at: s.shared_created_at,
//         author_id: s.author_id,
//         user_name: s.user_name,
//         content_text: s.content_text,
//         media_url: s.media_url,
//         media_type: s.media_type,
//         created_at: s.shared_created_at, // show when it was shared
//         like_count: Number(s.like_count || 0),
//         comment_count: Number(s.comment_count || 0),
//         share_count: Number(s.share_count || 0),
//         liked_by_me: !!s.liked_by_me,
//         comments: [] // will populate below
//       });
//     }

//     // Sort combined list by created_at descending
//     normalized.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

//     // Fetch last 5 comments for each distinct post id (dedupe)
//     const distinctPostIds = Array.from(new Set(normalized.map(p => p.original_post_id)));
//     // For small number of posts this loop is fine
//     for (const postId of distinctPostIds) {
//       const comments = await Comment.getCommentsForPost(postId, 5);
//       // assign comments to all normalized entries with that original_post_id
//       normalized.forEach(n => {
//         if (n.original_post_id === postId) n.comments = comments;
//       });
//     }

//     res.json({ posts: normalized });
//   } catch (err) {
//     console.error("getAllPosts error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // GET /api/posts/limit
// exports.getPostLimitInfo = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const friendCount = await Friend.getFriendCount(userId);
//     const allowed = getAllowedPostsPerDay(friendCount);
//     const todayCount = await Post.getTodayPostCount(userId);

//     res.json({
//       friend_count: friendCount,
//       allowed_per_day: allowed === Infinity ? -1 : allowed,
//       posted_today: todayCount,
//     });
//   } catch (err) {
//     console.error("getPostLimitInfo error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


const Post = require("../models/post.model");
const Friend = require("../models/friend.model");
const db = require("../config/db");
const Comment = require("../models/comment.model");
const Like = require("../models/like.model");

function getAllowedPostsPerDay(friendCount) {
  if (friendCount === 0) return 0;
  if (friendCount <= 10) return friendCount;
  return Infinity;
}

exports.createPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const content_text = String(req.body?.content_text || "").trim();
    if (!content_text) {
      return res.status(400).json({ message: "Post content is required" });
    }

    let media_url = null;
    let media_type = "none";

    if (req.file) {
      media_url = `/uploads/${req.file.filename}`;
      if (req.file.mimetype.startsWith("image/")) media_type = "image";
      else if (req.file.mimetype.startsWith("video/")) media_type = "video";
    } else if (req.body.media_url) {
      media_url = req.body.media_url;
      media_type = "link";
    }

    const friendCount = await Friend.getFriendCount(userId);
    const allowed = getAllowedPostsPerDay(friendCount);
    if (allowed === 0) {
      return res.status(403).json({ message: "You need at least 1 friend to post." });
    }

    const todayCount = await Post.getTodayPostCount(userId);
    if (todayCount >= allowed) {
      return res.status(403).json({ message: "Post limit reached." });
    }

    const postId = await Post.createPost(userId, content_text, media_url, media_type);
    res.status(201).json({ message: "Post created", postId, media_url });
  } catch (err) {
    console.error("createPost error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    let friendIds = await Friend.getFriendIds(currentUserId);
    const allowedIds = Array.from(new Set([currentUserId, ...friendIds]));

    const postsResult = await db.query(
      `
      SELECT
        p.id,
        p.user_id AS author_id,
        u.name AS user_name,
        p.content_text,
        p.media_url,
        p.media_type,
        p.created_at,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
        (SELECT COUNT(*) FROM shares s WHERE s.post_id = p.id) AS share_count,
        EXISTS (
          SELECT 1 FROM likes l2
          WHERE l2.post_id = p.id AND l2.user_id = $1
        ) AS liked_by_me
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ANY($2)
      ORDER BY p.created_at DESC
      `,
      [currentUserId, allowedIds]
    );

    const posts = postsResult.rows.map(p => ({
      ...p,
      liked_by_me: !!p.liked_by_me,
      comments: []
    }));

    for (const post of posts) {
      post.comments = await Comment.getCommentsForPost(post.id, 5);
    }

    res.json({ posts });
  } catch (err) {
    console.error("getAllPosts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPostLimitInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendCount = await Friend.getFriendCount(userId);
    const allowed = getAllowedPostsPerDay(friendCount);
    const todayCount = await Post.getTodayPostCount(userId);

    res.json({
      friend_count: friendCount,
      allowed_per_day: allowed === Infinity ? -1 : allowed,
      posted_today: todayCount,
    });
  } catch (err) {
    console.error("getPostLimitInfo error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
