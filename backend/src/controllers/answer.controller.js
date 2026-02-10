const db = require("../config/db");
// get answers for question
exports.getAnswers = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const [rows] = await db.query(`
    SELECT 
      a.id,
      a.content,
      a.upvotes,
      a.downvotes,
      a.user_id,
      u.name,
      IF(a.user_id = ?, 1, 0) AS mine
    FROM answers a
    JOIN users u ON a.user_id = u.id
    WHERE a.question_id = ?
    ORDER BY a.created_at DESC
  `, [userId, id]);

  res.json({ answers: rows });
};


exports.addAnswer = async (req, res) => {
  const userId = req.user.id;
  const { questionId, content } = req.body;

  await db.query(
    "INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)",
    [questionId, userId, content]
  );

  // +5 points for answering
  await db.query(
    "UPDATE users SET points = points + 5 WHERE id = ?",
    [userId]
  );

  res.json({ message: "Answer posted (+5 points)" });
};

exports.upvoteAnswer = async (req, res) => {
  const userId = req.user.id;
  const { answerId } = req.body;

  // check existing vote
  const [[existing]] = await db.query(
    "SELECT vote FROM answer_votes WHERE answer_id = ? AND user_id = ?",
    [answerId, userId]
  );

  // already upvoted
  if (existing?.vote === "up") {
    return res.status(400).json({ message: "Already upvoted" });
  }

  // remove previous downvote
  if (existing?.vote === "down") {
    await db.query(
      "DELETE FROM answer_votes WHERE answer_id = ? AND user_id = ?",
      [answerId, userId]
    );

    await db.query(
      "UPDATE answers SET downvotes = downvotes - 1 WHERE id = ?",
      [answerId]
    );

    await db.query(
      "UPDATE users u JOIN answers a ON u.id = a.user_id SET u.points = u.points + 1 WHERE a.id = ?",
      [answerId]
    );
  }

  // add upvote
  await db.query(
    "INSERT INTO answer_votes (answer_id, user_id, vote) VALUES (?, ?, 'up')",
    [answerId, userId]
  );

  await db.query(
    "UPDATE answers SET upvotes = upvotes + 1 WHERE id = ?",
    [answerId]
  );

  // BONUS at 5 upvotes
  const [[ans]] = await db.query(
    "SELECT upvotes, user_id FROM answers WHERE id = ?",
    [answerId]
  );

  if (ans.upvotes === 5) {
    await db.query(
      "UPDATE users SET points = points + 5 WHERE id = ?",
      [ans.user_id]
    );
  }

  res.json({ message: "Upvoted" });
};



exports.downvoteAnswer = async (req, res) => {
  const userId = req.user.id;
  const { answerId } = req.body;

  const [[existing]] = await db.query(
    "SELECT vote FROM answer_votes WHERE answer_id = ? AND user_id = ?",
    [answerId, userId]
  );

  if (existing?.vote === "down") {
    return res.status(400).json({ message: "Already downvoted" });
  }

  // remove previous upvote
  if (existing?.vote === "up") {
    await db.query(
      "DELETE FROM answer_votes WHERE answer_id = ? AND user_id = ?",
      [answerId, userId]
    );

    await db.query(
      "UPDATE answers SET upvotes = upvotes - 1 WHERE id = ?",
      [answerId]
    );
  }

  await db.query(
    "INSERT INTO answer_votes (answer_id, user_id, vote) VALUES (?, ?, 'down')",
    [answerId, userId]
  );

  await db.query(
    "UPDATE answers SET downvotes = downvotes + 1 WHERE id = ?",
    [answerId]
  );

  await db.query(
    "UPDATE users u JOIN answers a ON u.id = a.user_id SET u.points = u.points - 1 WHERE a.id = ?",
    [answerId]
  );

  res.json({ message: "Downvoted (-1 point)" });
};



exports.deleteAnswer = async (req, res) => {
  const userId = req.user.id;
  const { answerId } = req.body;

  const [[ans]] = await db.query(
    "SELECT * FROM answers WHERE id = ? AND user_id = ?",
    [answerId, userId]
  );

  if (!ans) return res.status(403).json({ message: "Not allowed" });

  await db.query("DELETE FROM answers WHERE id = ?", [answerId]);
  await db.query(
    "UPDATE users SET points = points - 5 WHERE id = ?",
    [userId]
  );

  res.json({ message: "Answer deleted (-5 points)" });
};
