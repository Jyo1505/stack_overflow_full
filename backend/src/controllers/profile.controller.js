const db = require("../config/db");

exports.getProfile = async (req, res) => {
  const [[user]] = await db.query(
    "SELECT id, name, email, points FROM users WHERE id = ?",
    [req.user.id]
  );
  res.json(user);
};

exports.transferPoints = async (req, res) => {
  const fromUser = req.user.id;
  const { toUserId, points } = req.body;

  const [[sender]] = await db.query(
    "SELECT points FROM users WHERE id = ?",
    [fromUser]
  );

  if (sender.points < 10)
    return res.status(403).json({ message: "Need at least 10 points" });

  if (points > sender.points)
    return res.status(400).json({ message: "Insufficient points" });

  if (fromUser === toUserId)
    return res.status(400).json({ message: "Cannot transfer to yourself" });

  await db.query(
    "UPDATE users SET points = points - ? WHERE id = ?",
    [points, fromUser]
  );

  await db.query(
    "UPDATE users SET points = points + ? WHERE id = ?",
    [points, toUserId]
  );

  await db.query(
    "INSERT INTO point_transfers (from_user, to_user, points) VALUES (?, ?, ?)",
    [fromUser, toUserId, points]
  );

  res.json({ message: "Points transferred successfully" });
};
