const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // you can use smtp too
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to, subject, html) {
  return transporter.sendMail({
    from: `PlantMate <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
