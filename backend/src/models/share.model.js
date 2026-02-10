const db = require("../config/db");

async function addShare(postId, userId) {
  const [result] = await db.query(
    "INSERT INTO shares (post_id, user_id) VALUES (?, ?)",
    [postId, userId]
  );
  return result.insertId;
}

// create a shared_posts entry for a given target user
async function addSharedPostForUser(originalPostId, sharedByUserId, ownerUserId) {
  const [result] = await db.query(
    "INSERT INTO shared_posts (original_post_id, shared_by, owner_user_id) VALUES (?, ?, ?)",
    [originalPostId, sharedByUserId, ownerUserId]
  );
  return result.insertId;
}

async function getShareCount(postId) {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS count FROM shares WHERE post_id = ?",
    [postId]
  );
  return rows[0]?.count || 0;
}

module.exports = { addShare, addSharedPostForUser, getShareCount };
