// const db = require("../config/db");

// async function createPost(userId, contentText, mediaUrl, mediaType) {
//   const [result] = await db.query(
//     "INSERT INTO posts (user_id, content_text, media_url, media_type) VALUES (?, ?, ?, ?)",
//     [userId, contentText, mediaUrl, mediaType]
//   );
//   return result.insertId;
// }
// async function findById(postId) {
//   // returns single post row or null
//   const [rows] = await db.query(
//     `SELECT p.*, u.name AS user_name, u.id AS user_id
//      FROM posts p
//      JOIN users u ON p.user_id = u.id
//      WHERE p.id = ? LIMIT 1`,
//     [postId]
//   );
//   return rows && rows.length ? rows[0] : null;
// }
// async function getTodayPostCount(userId) {
//   const [rows] = await db.query(
//     `SELECT COUNT(*) AS count
//      FROM posts
//      WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
//     [userId]
//   );
//   return rows[0].count;
// }

// async function getAllPosts() {
//   const [rows] = await db.query(
//     `SELECT p.id, p.content_text, p.media_url, p.media_type, p.created_at,
//             u.id AS user_id, u.name AS user_name
//      FROM posts p
//      JOIN users u ON p.user_id = u.id
//      ORDER BY p.created_at DESC`
//   );
//   return rows;
// }
// async function getPostsWithMeta(userId) {
//   // fetch posts + like_count + whether current user liked them + limited comments
//   const [posts] = await db.query(
//     `SELECT p.id, p.content_text, p.media_url, p.media_type, p.created_at,
//             u.id AS user_id, u.name AS user_name,
//             (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
//             (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
//      FROM posts p
//      JOIN users u ON p.user_id = u.id
//      ORDER BY p.created_at DESC`
//   );
//   return posts;
// }
// async function getLikeCountForPosts() {
//   const [rows] = await db.query(
//     `SELECT post_id, COUNT(*) AS likes
//      FROM likes
//      GROUP BY post_id`
//   );
//   return rows;
// }
// async function deleteById(id) {
//   const [r] = await db.query("DELETE FROM posts WHERE id = ?", [id]);
//   return r.affectedRows;
// }


// module.exports = {
//   createPost,
//   getTodayPostCount,
//   getAllPosts,
//   getLikeCountForPosts,
//   getPostsWithMeta,
//    findById,
//    deleteById,
// };


const db = require("../config/db");

async function createPost(userId, contentText, mediaUrl, mediaType) {
  const result = await db.query(
    `
    INSERT INTO posts (user_id, content_text, media_url, media_type)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `,
    [userId, contentText, mediaUrl, mediaType]
  );
  return result.rows[0].id;
}

async function findById(postId) {
  const result = await db.query(
    `
    SELECT p.*, u.name AS user_name
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1
    `,
    [postId]
  );
  return result.rows[0] || null;
}

async function getTodayPostCount(userId) {
  const result = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM posts
    WHERE user_id = $1
      AND created_at::date = CURRENT_DATE
    `,
    [userId]
  );
  return Number(result.rows[0].count);
}

async function deleteById(id) {
  const result = await db.query(
    "DELETE FROM posts WHERE id = $1",
    [id]
  );
  return result.rowCount;
}

module.exports = {
  createPost,
  findById,
  getTodayPostCount,
  deleteById,
};
