const User = require("../models/user.model");
const db = require("../config/db"); 
// GET /api/users/me  (already exists)
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

// GET /api/users/list - returns all other users (no auth required? we protect it)
exports.getOtherUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await User.getAllOtherUsers(currentUserId);
    res.json({ users });
  } catch (err) {
    console.error("getOtherUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/users/search?q=...  (optional)


exports.searchUsers = async (req, res) => {
  try {
    const { name } = req.query;
    const currentUserId = req.user.id;

    if (!name || name.trim().length < 1) {
      return res.json({ users: [] });
    }

    const [users] = await db.query(
      `
      SELECT id, name 
      FROM users 
      WHERE name LIKE ? 
        AND id != ?
      LIMIT 5
      `,
      [`%${name}%`, currentUserId]
    );

    res.json({ users });
  } catch (err) {
    console.error("searchUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  const [[user]] = await db.query(
    "SELECT id, name, email, points FROM users WHERE id = ?",
    [userId]
  );

  res.json(user);
};
