const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME || 'Shreyarth Resolve'}" <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html
  });
};

module.exports = sendEmail;
