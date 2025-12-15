const nodemailer = require("nodemailer");

let transporter = null;

// Initialize transporter only if credentials are available
if (process.env.SMTP_EMAIL && process.env.SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("✅ Email transporter initialized");
  } catch (err) {
    console.error("❌ Failed to initialize email transporter:", err.message);
  }
} else {
  console.warn("⚠️ SMTP_EMAIL or SMTP_PASS not set - email notifications disabled");
}

async function sendEmail(to, subject, html) {
  if (!transporter) {
    throw new Error("Email transporter not configured. Please set SMTP_EMAIL and SMTP_PASS environment variables.");
  }

  if (!to) {
    throw new Error("Recipient email address is required");
  }

  try {
    const info = await transporter.sendMail({
      from: `PlantMate <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
}

module.exports = { sendEmail };
