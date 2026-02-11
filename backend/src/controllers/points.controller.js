// const db = require("../config/db");

// exports.transferPoints = async (req, res) => {
//   try {
//     const fromUserId = req.user.id;
//     const { toUserId, points } = req.body;

//     if (!toUserId || points <= 0) {
//       return res.status(400).json({ message: "Invalid transfer data" });
//     }

//     if (fromUserId == toUserId) {
//       return res.status(400).json({ message: "Cannot transfer to yourself" });
//     }

//     const [[fromUser]] = await db.query(
//       "SELECT points FROM users WHERE id = ?",
//       [fromUserId]
//     );

//     if (fromUser.points <= 10) {
//       return res.status(403).json({
//         message: "You must have more than 10 points to transfer"
//       });
//     }

//     if (fromUser.points < points) {
//       return res.status(400).json({
//         message: "Insufficient points"
//       });
//     }

//     const [[toUser]] = await db.query(
//       "SELECT id FROM users WHERE id = ?",
//       [toUserId]
//     );

//     if (!toUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     await db.query(
//       "UPDATE users SET points = points - ? WHERE id = ?",
//       [points, fromUserId]
//     );

//     await db.query(
//       "UPDATE users SET points = points + ? WHERE id = ?",
//       [points, toUserId]
//     );

//     res.json({ message: "Points transferred successfully" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Transfer failed" });
//   }
// };


const db = require("../config/db");

exports.transferPoints = async (req, res) => {
  try {
    const fromUserId = req.user.id;
    const { toUserId, points } = req.body;

    if (!toUserId || points <= 0) {
      return res.status(400).json({ message: "Invalid transfer data" });
    }

    if (fromUserId == toUserId) {
      return res.status(400).json({ message: "Cannot transfer to yourself" });
    }

    const fromResult = await db.query(
      "SELECT points FROM users WHERE id = $1",
      [fromUserId]
    );

    const fromUser = fromResult.rows[0];

    if (!fromUser) {
      return res.status(404).json({ message: "Sender not found" });
    }

    if (fromUser.points <= 10) {
      return res.status(403).json({
        message: "You must have more than 10 points to transfer"
      });
    }

    if (fromUser.points < points) {
      return res.status(400).json({
        message: "Insufficient points"
      });
    }

    const toResult = await db.query(
      "SELECT id FROM users WHERE id = $1",
      [toUserId]
    );

    if (!toResult.rows[0]) {
      return res.status(404).json({ message: "User not found" });
    }

    await db.query(
      "UPDATE users SET points = points - $1 WHERE id = $2",
      [points, fromUserId]
    );

    await db.query(
      "UPDATE users SET points = points + $1 WHERE id = $2",
      [points, toUserId]
    );

    res.json({ message: "Points transferred successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Transfer failed" });
  }
};
