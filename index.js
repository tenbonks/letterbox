require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Utility function to check if a value is empty
function isEmpty(value) {
  return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
  );
}

// Generate a simple HTML email template
function generateEmailHTML(subject, text, company = {}) {
  const { name, address, phone } = company;

  return `
  <div style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 30px;">
    <div style="max-width: 600px; background: #ffffff; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <div style="background-color: #007bff; color: #fff; padding: 20px;">
        <h2 style="margin: 0;">${subject}</h2>
      </div>
      <div style="padding: 20px; color: #333;">
        <p style="white-space: pre-wrap;">${text}</p>
      </div>
      ${
      !isEmpty(company)
          ? `<div style="background-color: #f1f1f1; padding: 15px; font-size: 14px; color: #555;">
              <strong>${name || ''}</strong><br>
              ${address ? `${address}<br>` : ''}
              ${phone ? `Phone: ${phone}` : ''}
            </div>`
          : ''
  }
    </div>
    <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 15px;">
      Sent via Letterbox Mailer
    </p>
  </div>
  `;
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/send', async (req, res) => {
  const { to, subject, text, company } = req.body;

  // validate required fields
  if (isEmpty(to)) return res.status(400).json({ error: "missing 'to'" });
  if (isEmpty(subject)) return res.status(400).json({ error: "missing 'subject'" });
  if (isEmpty(text)) return res.status(400).json({ error: "missing 'text'" });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text, // plain text version
      html: generateEmailHTML(subject, text, company), // HTML version
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`letterbox running on port ${PORT}`));
