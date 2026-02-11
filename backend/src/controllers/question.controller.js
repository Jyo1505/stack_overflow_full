// const db = require("../config/db");

// exports.postQuestion = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { title } = req.body;

//     if (!title) {
//       return res.status(400).json({ message: "Question title is required" });
//     }

//     /* ======================
//        SUBSCRIPTION LIMIT
//        ====================== */
//     const [[plan]] = await db.query(
//       `SELECT questions_per_day FROM subscriptions
//        WHERE user_id = ?
//        ORDER BY created_at DESC LIMIT 1`,
//       [userId]
//     );

//     const limit = plan?.questions_per_day ?? 1;

//     if (limit !== -1) {
//       const [[count]] = await db.query(
//         `SELECT COUNT(*) AS total
//          FROM questions
//          WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
//         [userId]
//       );

//       if (count.total >= limit) {
//         return res.status(403).json({
//           message: "Daily question limit reached"
//         });
//       }
//     }

//     /* ======================
//        SAVE QUESTION (NO AI)
//        ====================== */
//     const [result] = await db.query(
//       "INSERT INTO questions (user_id, title, created_at) VALUES (?, ?, NOW())",
//       [userId, title]
//     );

//     res.json({
//       message: "Question posted successfully",
//       questionId: result.insertId
//     });

//   } catch (err) {
//     console.error("postQuestion error:", err);
//     res.status(500).json({ message: "Failed to post question" });
//   }
// };


// exports.getAllQuestions = async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT 
//         q.id,
//         q.title,
//         q.created_at,
//         u.name AS asked_by
//       FROM questions q
//       JOIN users u ON q.user_id = u.id
//       ORDER BY q.created_at DESC
//     `);

//     res.json({ questions: rows });
//   } catch (err) {
//     console.error("getAllQuestions error:", err);
//     res.status(500).json({ message: "Failed to load questions" });
//   }
// };

// // get single question
// exports.getQuestionById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const [[q]] = await db.query(`
//       SELECT q.id, q.title, u.name AS asked_by
//       FROM questions q
//       JOIN users u ON q.user_id = u.id
//       WHERE q.id = ?
//     `, [id]);

//     if (!q) {
//       return res.status(404).json({ message: "Question not found" });
//     }

//     res.json(q);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to load question" });
//   }
// };

const db = require("../config/db");

exports.postQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Question title is required" });
    }

    /* SUBSCRIPTION LIMIT */
    const planResult = await db.query(
      `
      SELECT questions_per_day
      FROM subscriptions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [userId]
    );

    const plan = planResult.rows[0];
    const limit = plan?.questions_per_day ?? 1;

    if (limit !== -1) {
      const countResult = await db.query(
        `
        SELECT COUNT(*) AS total
        FROM questions
        WHERE user_id = $1
        AND DATE(created_at) = CURRENT_DATE
        `,
        [userId]
      );

      const total = Number(countResult.rows[0].total);

      if (total >= limit) {
        return res.status(403).json({
          message: "Daily question limit reached"
        });
      }
    }

    const insertResult = await db.query(
      `
      INSERT INTO questions (user_id, title)
      VALUES ($1, $2)
      RETURNING id
      `,
      [userId, title]
    );

    res.json({
      message: "Question posted successfully",
      questionId: insertResult.rows[0].id
    });

  } catch (err) {
    console.error("postQuestion error:", err);
    res.status(500).json({ message: "Failed to post question" });
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        q.id,
        q.title,
        q.created_at,
        u.name AS asked_by
      FROM questions q
      JOIN users u ON q.user_id = u.id
      ORDER BY q.created_at DESC
    `);

    res.json({ questions: result.rows });

  } catch (err) {
    console.error("getAllQuestions error:", err);
    res.status(500).json({ message: "Failed to load questions" });
  }
};

exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT q.id, q.title, u.name AS asked_by
      FROM questions q
      JOIN users u ON q.user_id = u.id
      WHERE q.id = $1
      `,
      [id]
    );

    const q = result.rows[0];

    if (!q) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json(q);

  } catch (err) {
    res.status(500).json({ message: "Failed to load question" });
  }
};
