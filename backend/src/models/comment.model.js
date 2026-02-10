


const db = require("../config/db");

async function addComment(postId, userId, text) {
  const [result] = await db.query(
    "INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)",
    [postId, userId, text]
  );
  return result.insertId;
}

async function getCommentsForPost(postId, limit = 5) {
  const [rows] = await db.query(
    `SELECT c.id, c.text, c.created_at, u.id AS user_id, u.name AS user_name
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.post_id = ?
     ORDER BY c.created_at DESC
     LIMIT ?`,
    [postId, limit]
  );
  return rows;
}

module.exports = { addComment, getCommentsForPost };
