// const db = require("../config/db");

// async function sendRequest(fromUserId, toUserId) {
//   // Check if already friends
//   const [existingFriend] = await db.query(
//     `SELECT * FROM friendships 
//      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
//     [fromUserId, toUserId, toUserId, fromUserId]
//   );
//   if (existingFriend.length > 0) {
//     throw new Error("You are already friends");
//   }

//   // Check if request already exists
//   const [existingReq] = await db.query(
//     `SELECT * FROM friend_requests
//      WHERE from_user_id = ? AND to_user_id = ? AND status = 'pending'`,
//     [fromUserId, toUserId]
//   );
//   if (existingReq.length > 0) {
//     throw new Error("Friend request already sent");
//   }

//   const [result] = await db.query(
//     "INSERT INTO friend_requests (from_user_id, to_user_id) VALUES (?, ?)",
//     [fromUserId, toUserId]
//   );
//   return result.insertId;
// }

// async function getIncomingRequests(userId) {
//   const [rows] = await db.query(
//     `SELECT fr.id, u.id AS from_user_id, u.name, u.email
//      FROM friend_requests fr
//      JOIN users u ON fr.from_user_id = u.id
//      WHERE fr.to_user_id = ? AND fr.status = 'pending'`,
//     [userId]
//   );
//   return rows;
// }

// async function acceptRequest(requestId, userId) {
//   // Get request
//   const [rows] = await db.query(
//     "SELECT * FROM friend_requests WHERE id = ? AND to_user_id = ?",
//     [requestId, userId]
//   );
//   const req = rows[0];
//   if (!req) throw new Error("Request not found");

//   // Mark as accepted
//   await db.query(
//     "UPDATE friend_requests SET status = 'accepted' WHERE id = ?",
//     [requestId]
//   );

//   // Create friendship
//   const u1 = Math.min(req.from_user_id, req.to_user_id);
//   const u2 = Math.max(req.from_user_id, req.to_user_id);

//   await db.query(
//     "INSERT IGNORE INTO friendships (user1_id, user2_id) VALUES (?, ?)",
//     [u1, u2]
//   );
// }

// async function getFriends(userId) {
//   const [rows] = await db.query(
//     `SELECT u.id, u.name, u.email
//      FROM friendships f
//      JOIN users u ON (u.id = IF(f.user1_id = ?, f.user2_id, f.user1_id))
//      WHERE f.user1_id = ? OR f.user2_id = ?`,
//     [userId, userId, userId]
//   );
//   return rows;
// }

// async function getFriendCount(userId) {
//   const [rows] = await db.query(
//     `SELECT COUNT(*) AS count
//      FROM friendships
//      WHERE user1_id = ? OR user2_id = ?`,
//     [userId, userId]
//   );
//   return rows[0].count;
// }
// async function getFriendIds(userId) {
//   const [rows] = await db.query(
//     `SELECT user1_id AS friend_id FROM friendships WHERE user2_id = ?
//      UNION
//      SELECT user2_id AS friend_id FROM friendships WHERE user1_id = ?`,
//     [userId, userId]
//   );
//   return rows.map(r => r.friend_id);
// }


// // NEW: remove friendship between two users (both directions)
// async function removeFriend(userA, userB) {
//   // remove any friendship row where those two users are paired
//   await db.query(
//     `DELETE FROM friendships
//      WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
//     [userA, userB, userB, userA]
//   );
// }
// module.exports = {
//   sendRequest,
//   getIncomingRequests,
//   acceptRequest,
//   getFriends,
//   getFriendCount,
//   getFriendIds,
//   removeFriend,
// };


// exports.removeFriend = async (userId, friendId) => {
//   // friendship can exist in either direction
//   const [result] = await db.query(
//     `
//     DELETE FROM friends
//     WHERE 
//       (user_id = ? AND friend_id = ?)
//       OR
//       (user_id = ? AND friend_id = ?)
//     `,
//     [userId, friendId, friendId, userId]
//   );

//   if (result.affectedRows === 0) {
//     throw new Error("Friendship not found");
//   }
// };

const db = require("../config/db");

/**
 * Send friend request
 */
async function sendRequest(fromUserId, toUserId) {
  // Check if already friends
  const existingFriend = await db.query(
    `
    SELECT 1 FROM friendships
    WHERE (user1_id = $1 AND user2_id = $2)
       OR (user1_id = $2 AND user2_id = $1)
    `,
    [fromUserId, toUserId]
  );

  if (existingFriend.rows.length > 0) {
    throw new Error("You are already friends");
  }

  // Check if request already exists
  const existingReq = await db.query(
    `
    SELECT 1 FROM friend_requests
    WHERE from_user_id = $1
      AND to_user_id = $2
      AND status = 'pending'
    `,
    [fromUserId, toUserId]
  );

  if (existingReq.rows.length > 0) {
    throw new Error("Friend request already sent");
  }

  const result = await db.query(
    `
    INSERT INTO friend_requests (from_user_id, to_user_id)
    VALUES ($1, $2)
    RETURNING id
    `,
    [fromUserId, toUserId]
  );

  return result.rows[0].id;
}

/**
 * Get incoming friend requests
 */
async function getIncomingRequests(userId) {
  const result = await db.query(
    `
    SELECT
      fr.id,
      u.id AS from_user_id,
      u.name,
      u.email
    FROM friend_requests fr
    JOIN users u ON fr.from_user_id = u.id
    WHERE fr.to_user_id = $1
      AND fr.status = 'pending'
    `,
    [userId]
  );

  return result.rows;
}

/**
 * Accept friend request
 */
async function acceptRequest(requestId, userId) {
  // Get request
  const result = await db.query(
    `
    SELECT * FROM friend_requests
    WHERE id = $1 AND to_user_id = $2
    `,
    [requestId, userId]
  );

  const req = result.rows[0];
  if (!req) throw new Error("Request not found");

  // Mark as accepted
  await db.query(
    `UPDATE friend_requests SET status = 'accepted' WHERE id = $1`,
    [requestId]
  );

  // Normalize user order
  const u1 = Math.min(req.from_user_id, req.to_user_id);
  const u2 = Math.max(req.from_user_id, req.to_user_id);

  // INSERT IGNORE replacement
  await db.query(
    `
    INSERT INTO friendships (user1_id, user2_id)
    VALUES ($1, $2)
    ON CONFLICT (user1_id, user2_id) DO NOTHING
    `,
    [u1, u2]
  );
}

/**
 * Get friends list
 */
async function getFriends(userId) {
  const result = await db.query(
    `
    SELECT u.id, u.name, u.email
    FROM friendships f
    JOIN users u
      ON u.id = CASE
        WHEN f.user1_id = $1 THEN f.user2_id
        ELSE f.user1_id
      END
    WHERE f.user1_id = $1 OR f.user2_id = $1
    `,
    [userId]
  );

  return result.rows;
}

/**
 * Get friend count
 */
async function getFriendCount(userId) {
  const result = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM friendships
    WHERE user1_id = $1 OR user2_id = $1
    `,
    [userId]
  );

  return Number(result.rows[0].count);
}

/**
 * Get friend IDs
 */
async function getFriendIds(userId) {
  const result = await db.query(
    `
    SELECT user1_id AS friend_id FROM friendships WHERE user2_id = $1
    UNION
    SELECT user2_id AS friend_id FROM friendships WHERE user1_id = $1
    `,
    [userId]
  );

  return result.rows.map(r => r.friend_id);
}

/**
 * Remove friendship
 */
async function removeFriend(userA, userB) {
  const result = await db.query(
    `
    DELETE FROM friendships
    WHERE (user1_id = $1 AND user2_id = $2)
       OR (user1_id = $2 AND user2_id = $1)
    `,
    [userA, userB]
  );

  if (result.rowCount === 0) {
    throw new Error("Friendship not found");
  }
}

module.exports = {
  sendRequest,
  getIncomingRequests,
  acceptRequest,
  getFriends,
  getFriendCount,
  getFriendIds,
  removeFriend,
};
