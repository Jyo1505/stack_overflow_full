// const db = require("../config/db");

// /**
//  * Find user by email (email is unique)
//  * Used for login, forgot password, auth
//  */
// async function findByEmail(email) {
//   const [rows] = await db.query(
//     "SELECT * FROM users WHERE email = ? LIMIT 1",
//     [email]
//   );
//   return rows[0];
// }

// /**
//  * Find user by ID (PRIMARY identity)
//  * Used everywhere for logic
//  */
// async function findById(id) {
//   const [rows] = await db.query(
//     "SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1",
//     [id]
//   );
//   return rows[0];
// }

// /**
//  * Create new user
//  */
// async function createUser(name, email, passwordHash) {
//   const [result] = await db.query(
//     "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
//     [name, email, passwordHash]
//   );

//   return {
//     id: result.insertId,
//     name,
//     email,
//   };
// }

// /**
//  * Search users by name (DISPLAY ONLY)
//  * ⚠️ Never use this for logic checks
//  */
// async function searchByName(query) {
//   const [rows] = await db.query(
//     `SELECT id, name, email
//      FROM users
//      WHERE name LIKE ?
//      ORDER BY name
//      LIMIT 50`,
//     [`%${query}%`]
//   );
//   return rows;
// }

// /**
//  * Get all users except:
//  * - current user
//  * - already friends
//  *
//  * Used for "Send Requests" page
//  */
// async function getAllOtherUsers(currentUserId) {
//   // Get friend IDs
//   const [friendRows] = await db.query(
//     `
//     SELECT user1_id AS friend_id FROM friendships WHERE user2_id = ?
//     UNION
//     SELECT user2_id AS friend_id FROM friendships WHERE user1_id = ?
//     `,
//     [currentUserId, currentUserId]
//   );

//   const excludedIds = [currentUserId, ...friendRows.map(r => r.friend_id)];

//   const placeholders = excludedIds.map(() => "?").join(",");

//   const sql = `
//     SELECT id, name, email
//     FROM users
//     WHERE id NOT IN (${placeholders})
//     ORDER BY name
//     LIMIT 100
//   `;

//   const [rows] = await db.query(sql, excludedIds);
//   return rows;
// }

// module.exports = {
//   findByEmail,
//   findById,
//   createUser,
//   searchByName,
//   getAllOtherUsers,
// };


const db = require("../config/db");

/**
 * Find user by email
 */
async function findByEmail(email) {
  const result = await db.query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return result.rows[0];
}

/**
 * Find user by ID
 */
async function findById(id) {
  const result = await db.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1 LIMIT 1",
    [id]
  );
  return result.rows[0];
}

/**
 * Create new user
 */
async function createUser(name, email, passwordHash) {
  const result = await db.query(
    `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email
    `,
    [name, email, passwordHash]
  );

  return result.rows[0];
}

/**
 * Search users by name
 */
async function searchByName(query) {
  const result = await db.query(
    `
    SELECT id, name, email
    FROM users
    WHERE name ILIKE $1
    ORDER BY name
    LIMIT 50
    `,
    [`%${query}%`]
  );

  return result.rows;
}

/**
 * Get all users except current user and friends
 */
async function getAllOtherUsers(currentUserId) {
  // Get friend IDs
  const friendResult = await db.query(
    `
    SELECT user1_id AS friend_id FROM friendships WHERE user2_id = $1
    UNION
    SELECT user2_id AS friend_id FROM friendships WHERE user1_id = $1
    `,
    [currentUserId]
  );

  const excludedIds = [
    currentUserId,
    ...friendResult.rows.map(r => r.friend_id),
  ];

  // Build placeholders dynamically: $1, $2, $3...
  const placeholders = excludedIds.map((_, i) => `$${i + 1}`).join(",");

  const result = await db.query(
    `
    SELECT id, name, email
    FROM users
    WHERE id NOT IN (${placeholders})
    ORDER BY name
    LIMIT 100
    `,
    excludedIds
  );

  return result.rows;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  searchByName,
  getAllOtherUsers,
};
