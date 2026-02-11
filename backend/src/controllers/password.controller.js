// const db = require("../config/db");
// const bcrypt = require("bcryptjs");
// const generatePassword = require("../utils/passwordGenerator");

// // STEP 1: Check email & daily limit
// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email is required" });
//     }

//     const [results] = await db.query(
//       "SELECT * FROM users WHERE email = ? LIMIT 1",
//       [email]
//     );

//     if (results.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = results[0];

//     if (user.last_password_reset) {
//       const diffHours =
//         (new Date() - new Date(user.last_password_reset)) /
//         (1000 * 60 * 60);

//       if (diffHours < 24) {
//         return res
//           .status(429)
//           .json({ message: "Password already reset today" });
//       }
//     }

//     // ✅ VERY IMPORTANT: always respond
//     return res.status(200).json({ email });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // STEP 2: Generate password (only once)
// exports.generatePassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const [results] = await db.query(
//       "SELECT * FROM users WHERE email = ? LIMIT 1",
//       [email]
//     );

//     if (results.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = results[0];

//     if (user.temp_password_hash) {
//       return res
//         .status(429)
//         .json({ message: "Password already generated today" });
//     }

//     const plainPassword = generatePassword();
//     const hash = await bcrypt.hash(plainPassword, 10);

//     await db.query(
//       "UPDATE users SET temp_password_hash = ? WHERE id = ?",
//       [hash, user.id]
//     );

//     return res.status(200).json({ generatedPassword: plainPassword });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // STEP 3: Final update password
// exports.updatePassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const [results] = await db.query(
//       "SELECT * FROM users WHERE email = ? LIMIT 1",
//       [email]
//     );

//     if (results.length === 0) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const user = results[0];

//     if (!user.temp_password_hash) {
//       return res
//         .status(400)
//         .json({ message: "Generate password first" });
//     }

//     await db.query(
//   `UPDATE users
//    SET password_hash = ?, 
//        temp_password_hash = NULL, 
//        last_password_reset = CURDATE()
//    WHERE id = ?`,
//   [user.temp_password_hash, user.id]
// );


//     return res
//       .status(200)
//       .json({ message: "Password updated successfully" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const generatePassword = require("../utils/passwordGenerator");

/* =========================
   STEP 1: CHECK EMAIL
========================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    if (user.last_password_reset) {
      const diffHours =
        (new Date() - new Date(user.last_password_reset)) /
        (1000 * 60 * 60);

      if (diffHours < 24) {
        return res
          .status(429)
          .json({ message: "Password already reset today" });
      }
    }

    return res.status(200).json({ email });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   STEP 2: GENERATE PASSWORD
========================= */
exports.generatePassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    if (user.temp_password_hash) {
      return res
        .status(429)
        .json({ message: "Password already generated today" });
    }

    const plainPassword = generatePassword();
    const hash = await bcrypt.hash(plainPassword, 10);

    await db.query(
      "UPDATE users SET temp_password_hash = $1 WHERE id = $2",
      [hash, user.id]
    );

    return res.status(200).json({ generatedPassword: plainPassword });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   STEP 3: FINAL UPDATE
========================= */
exports.updatePassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    if (!user.temp_password_hash) {
      return res
        .status(400)
        .json({ message: "Generate password first" });
    }

    await db.query(
      `
      UPDATE users
      SET password_hash = $1,
          temp_password_hash = NULL,
          last_password_reset = CURRENT_DATE
      WHERE id = $2
      `,
      [user.temp_password_hash, user.id]
    );

    return res
      .status(200)
      .json({ message: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
