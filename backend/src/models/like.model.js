

const db = require("../config/db");

async function addLike(postId, userId) {
  await db.query(
    "INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)",
    [postId, userId]
  );
}

async function removeLike(postId, userId) {
  await db.query("DELETE FROM likes WHERE post_id = ? AND user_id = ?", [
    postId,
    userId,
  ]);
}

async function getLikeCount(postId) {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS count FROM likes WHERE post_id = ?",
    [postId]
  );
  return rows[0].count;
}

async function isLikedByUser(postId, userId) {
  const [rows] = await db.query(
    "SELECT 1 FROM likes WHERE post_id = ? AND user_id = ? LIMIT 1",
    [postId, userId]
  );
  return rows.length > 0;
}

module.exports = { addLike, removeLike, getLikeCount, isLikedByUser };

