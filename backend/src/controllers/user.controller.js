// const User = require("../models/user.model");
// const db = require("../config/db"); 
// // GET /api/users/me  (already exists)
// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json({ user });
//   } catch (err) {
//     console.error("getMe error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // GET /api/users/list - returns all other users (no auth required? we protect it)
// exports.getOtherUsers = async (req, res) => {
//   try {
//     const currentUserId = req.user.id;
//     const users = await User.getAllOtherUsers(currentUserId);
//     res.json({ users });
//   } catch (err) {
//     console.error("getOtherUsers error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // GET /api/users/search?q=...  (optional)


// exports.searchUsers = async (req, res) => {
//   try {
//     const { name } = req.query;
//     const currentUserId = req.user.id;

//     if (!name || name.trim().length < 1) {
//       return res.json({ users: [] });
//     }

//     const [users] = await db.query(
//       `
//       SELECT id, name 
//       FROM users 
//       WHERE name LIKE ? 
//         AND id != ?
//       LIMIT 5
//       `,
//       [`%${name}%`, currentUserId]
//     );

//     res.json({ users });
//   } catch (err) {
//     console.error("searchUsers error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.getProfile = async (req, res) => {
//   const userId = req.user.id;

//   const [[user]] = await db.query(
//     "SELECT id, name, email, points FROM users WHERE id = ?",
//     [userId]
//   );

//   res.json(user);
// };

const User = require("../models/user.model");
const db = require("../config/db");

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOtherUsers = async (req, res) => {
  try {
    const users = await User.getAllOtherUsers(req.user.id);
    res.json({ users });
  } catch (err) {
    console.error("getOtherUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const name = req.query.name || "";
    if (!name.trim()) return res.json({ users: [] });

    const result = await db.query(
      `
      SELECT id, name
      FROM users
      WHERE name ILIKE $1 AND id != $2
      LIMIT 5
      `,
      [`%${name}%`, req.user.id]
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error("searchUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  const result = await db.query(
    "SELECT id, name, email, points FROM users WHERE id = $1",
    [req.user.id]
  );
  res.json(result.rows[0]);
};

exports.getAllUsersForTransfer = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name FROM users WHERE id != $1 ORDER BY name ASC",
      [req.user.id]
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error("getAllUsersForTransfer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
