
const Share = require("../models/share.model");
const Post = require("../models/post.model");
const Friend = require("../models/friend.model");
const db = require("../config/db");

exports.sharePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { postId, targetId } = req.body;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!postId) return res.status(400).json({ message: "postId required" });
    if (!targetId) return res.status(400).json({ message: "targetId required" });

    // check that targetId is indeed a friend of the sharer (prevent sharing to non-friends)
    const friendIds = await Friend.getFriendIds(userId);
    if (!friendIds.includes(Number(targetId))) {
      return res.status(403).json({ message: "Can only share to your friends." });
    }

    // optional: check original post exists
    const original = await Post.findById(postId);
    if (!original) return res.status(404).json({ message: "Original post not found" });

    // add analytics share record
    await Share.addShare(postId, userId);

    // add shared_posts record so the target sees the shared post in their feed
    await Share.addSharedPostForUser(postId, userId, targetId);

    // return updated share count
    const count = await Share.getShareCount(postId);
    res.json({ message: "Shared", share_count: count });
  } catch (err) {
    console.error("sharePost error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
