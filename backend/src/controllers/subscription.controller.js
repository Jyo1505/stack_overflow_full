const db = require("../config/db");

// PLAN ORDER (for upgrade / downgrade check)
const PLAN_ORDER = {
  FREE: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3
};

// BUY / UPGRADE PLAN (FAKE PAYMENT)
// const db = require("../config/db");
const { sendInvoiceMail } = require("../utils/mailer");

// const db = require("../config/db");
// const { sendInvoiceMail } = require("../utils/mailer");

const PLAN_RANK = {
  FREE: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
};

exports.buyPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;

    /* =========================
       TIME CHECK (10–11 AM IST)
       ========================= */
    // =========================
// TIME CHECK (10–11 AM IST)
// =========================
const now = new Date();

// Convert to IST properly
const istTime = new Date(
  now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
);

const hour = istTime.getHours();    // 0–23
// const minute = istTime.getMinutes();

if (hour !== 10) {
  return res.status(403).json({
    message: "Payments allowed only between 10–11 AM IST",
  });
}


    /* =========================
       VALIDATE PLAN
       ========================= */
    if (!PLAN_RANK.hasOwnProperty(plan)) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    /* =========================
       GET CURRENT PLAN
       ========================= */
    const [[current]] = await db.query(
      `SELECT plan FROM subscriptions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    const currentPlan = current?.plan || "FREE";

    // ❌ Same plan
    if (currentPlan === plan) {
      return res.status(400).json({
        message: "You already have this plan",
      });
    }

    // ❌ Downgrade
    if (PLAN_RANK[plan] < PLAN_RANK[currentPlan]) {
      return res.status(400).json({
        message: "Plan downgrade is not allowed",
      });
    }

    /* =========================
       PLAN DETAILS
       ========================= */
    let price = 0;
    let limit = 1;

    if (plan === "BRONZE") {
      price = 100; limit = 5;
    } else if (plan === "SILVER") {
      price = 300; limit = 10;
    } else if (plan === "GOLD") {
      price = 1000; limit = -1;
    }

    /* =========================
       SAVE SUBSCRIPTION
       ========================= */
    await db.query(
      `INSERT INTO subscriptions
       (user_id, plan, price, questions_per_day, start_date, end_date)
       VALUES (?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY))`,
      [userId, plan, price, limit]
    );

    /* =========================
       SEND INVOICE EMAIL
       ========================= */
    const [[user]] = await db.query(
      "SELECT email FROM users WHERE id = ?",
      [userId]
    );

    sendInvoiceMail(user.email, {
      plan,
      price,
      validity: "30 days",
    });

    res.json({
      message: "Payment successful",
      invoice: {
        plan,
        price,
        validity: "30 days",
      },
    });

  } catch (err) {
    console.error("buyPlan error:", err);
    res.status(500).json({ message: "Payment failed" });
  }
};



// GET CURRENT ACTIVE PLAN
exports.getMyPlan = async (req, res) => {
  const userId = req.user.id;

  const [rows] = await db.query(
    `SELECT plan, questions_per_day, end_date
     FROM subscriptions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  // default FREE plan
  if (!rows.length) {
    return res.json({
      plan: "FREE",
      questions_per_day: 1
    });
  }

  res.json(rows[0]);
};
