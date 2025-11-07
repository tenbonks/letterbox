require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());
app.set('trust proxy', true);


// --- CONFIG ---
const ALLOWED_IPS = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : [];
const API_KEY = process.env.API_KEY || null;

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

// --- AUTH MIDDLEWARE ---
app.use((req, res, next) => {
  let requestIP =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;

  // normalize IPv6 -> IPv4 where needed
  if (requestIP.startsWith('::ffff:')) requestIP = requestIP.replace('::ffff:', '');

  console.log('Incoming IP:', requestIP);

  const apiKeyHeader = req.headers['x-api-key'];

  // 1️⃣ Allow API key override
  if (API_KEY && apiKeyHeader === API_KEY) return next();

  // 2️⃣ Always trust localhost connections (internal services)
  const localIPs = ['127.0.0.1', '::1'];
  if (localIPs.includes(requestIP)) return next();

  // 3️⃣ Otherwise, check against whitelist
  if (ALLOWED_IPS.includes(requestIP)) return next();

  console.warn(`Unauthorized request from ${requestIP}`);
  return res.status(403).json({ error: 'Access denied' });
});


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

// --- LANDING PAGE ---
app.get('/', (req, res) => {
  res.send(`
  <html>
    <head>
      <title>Letterbox Mailer</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f8f9fa; color: #333; text-align: center; margin-top: 100px; }
        h1 { color: #007bff; }
        p { color: #555; }
        code { background: #eee; padding: 2px 6px; border-radius: 4px; }
      </style>
    </head>
    <body>
      <h1>📮 Letterbox Mailer</h1>
      <p>Your email relay server is running.</p>
      <p>If you can see this page, then your IP is whitelisted</p>
      <p>Use <code>POST /send</code> to send emails.</p>
    </body>
  </html>
  `);
});

// --- SEND EMAIL ROUTE ---
app.post('/send', async (req, res) => {
  const { to, subject, text, company } = req.body;

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
      text,
      html: generateEmailHTML(subject, text, company),
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`letterbox running on port ${PORT}`));
