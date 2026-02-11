

// const db = require("../config/db");

// async function addLike(postId, userId) {
//   await db.query(
//     "INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)",
//     [postId, userId]
//   );
// }

// async function removeLike(postId, userId) {
//   await db.query("DELETE FROM likes WHERE post_id = ? AND user_id = ?", [
//     postId,
//     userId,
//   ]);
// }

// async function getLikeCount(postId) {
//   const [rows] = await db.query(
//     "SELECT COUNT(*) AS count FROM likes WHERE post_id = ?",
//     [postId]
//   );
//   return rows[0].count;
// }

// async function isLikedByUser(postId, userId) {
//   const [rows] = await db.query(
//     "SELECT 1 FROM likes WHERE post_id = ? AND user_id = ? LIMIT 1",
//     [postId, userId]
//   );
//   return rows.length > 0;
// }

// module.exports = { addLike, removeLike, getLikeCount, isLikedByUser };

const db = require("../config/db");

async function addLike(postId, userId) {
  await db.query(
    `
    INSERT INTO likes (post_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT (post_id, user_id) DO NOTHING
    `,
    [postId, userId]
  );
}

async function removeLike(postId, userId) {
  await db.query(
    `
    DELETE FROM likes
    WHERE post_id = $1 AND user_id = $2
    `,
    [postId, userId]
  );
}

async function getLikeCount(postId) {
  const result = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM likes
    WHERE post_id = $1
    `,
    [postId]
  );

  return Number(result.rows[0].count);
}

async function isLikedByUser(postId, userId) {
  const result = await db.query(
    `
    SELECT 1
    FROM likes
    WHERE post_id = $1 AND user_id = $2
    LIMIT 1
    `,
    [postId, userId]
  );

  return result.rows.length > 0;
}

module.exports = { addLike, removeLike, getLikeCount, isLikedByUser };
