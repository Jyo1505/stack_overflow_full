const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // App password
  },
});

async function sendInvoiceMail(to, invoice) {
  try {
    await transporter.sendMail({
      from: `"Public Space" <${process.env.MAIL_USER}>`,
      to,
      subject: "Subscription Invoice - Public Space",
      html: `
        <h2>Subscription Successful</h2>
        <p><b>Plan:</b> ${invoice.plan}</p>
        <p><b>Amount:</b> ₹${invoice.price}</p>
        <p><b>Validity:</b> ${invoice.validity}</p>
        <p>Thank you for subscribing!</p>
      `,
    });
    console.log("📧 Invoice email sent");
  } catch (err) {
    console.warn("⚠️ Email failed:", err.message);
  }
}

module.exports = { sendInvoiceMail };
