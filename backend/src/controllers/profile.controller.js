// const db = require("../config/db");

// exports.getProfile = async (req, res) => {
//   const [[user]] = await db.query(
//     "SELECT id, name, email, points FROM users WHERE id = ?",
//     [req.user.id]
//   );
//   res.json(user);
// };

// exports.transferPoints = async (req, res) => {
//   const fromUser = req.user.id;
//   const { toUserId, points } = req.body;

//   const [[sender]] = await db.query(
//     "SELECT points FROM users WHERE id = ?",
//     [fromUser]
//   );

//   if (sender.points < 10)
//     return res.status(403).json({ message: "Need at least 10 points" });

//   if (points > sender.points)
//     return res.status(400).json({ message: "Insufficient points" });

//   if (fromUser === toUserId)
//     return res.status(400).json({ message: "Cannot transfer to yourself" });

//   await db.query(
//     "UPDATE users SET points = points - ? WHERE id = ?",
//     [points, fromUser]
//   );

//   await db.query(
//     "UPDATE users SET points = points + ? WHERE id = ?",
//     [points, toUserId]
//   );

//   await db.query(
//     "INSERT INTO point_transfers (from_user, to_user, points) VALUES (?, ?, ?)",
//     [fromUser, toUserId, points]
//   );

//   res.json({ message: "Points transferred successfully" });
// };

const db = require("../config/db");

exports.getProfile = async (req, res) => {
  const result = await db.query(
    "SELECT id, name, email, points FROM users WHERE id = $1",
    [req.user.id]
  );

  res.json(result.rows[0]);
};

exports.transferPoints = async (req, res) => {
  const fromUser = req.user.id;
  const { toUserId, points } = req.body;

  const senderResult = await db.query(
    "SELECT points FROM users WHERE id = $1",
    [fromUser]
  );

  const sender = senderResult.rows[0];

  if (!sender)
    return res.status(404).json({ message: "Sender not found" });

  if (sender.points < 10)
    return res.status(403).json({ message: "Need at least 10 points" });

  if (points > sender.points)
    return res.status(400).json({ message: "Insufficient points" });

  if (fromUser == toUserId)
    return res.status(400).json({ message: "Cannot transfer to yourself" });

  await db.query(
    "UPDATE users SET points = points - $1 WHERE id = $2",
    [points, fromUser]
  );

  await db.query(
    "UPDATE users SET points = points + $1 WHERE id = $2",
    [points, toUserId]
  );

  await db.query(
    "INSERT INTO point_transfers (from_user, to_user, points) VALUES ($1, $2, $3)",
    [fromUser, toUserId, points]
  );

  res.json({ message: "Points transferred successfully" });
};
