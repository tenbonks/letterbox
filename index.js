require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());
app.set('trust proxy', true);


const { isEmpty } = require("./src/js/utility/validation");
const { generateEmailHTML, generateLandingPageHTML } = require("./src/js/utility/html");
const { authorize } = require('./src/js/auth/authorize');


// --- AUTH MIDDLEWARE ---
app.use((req, res, next) => {
  authorize(req, res, next);
});

// --- LANDING PAGE ---
app.get('/', (req, res) => {
  res.send(
      generateLandingPageHTML()
  );
});

app.post('/test-connection', (req, res) => {
  res.status(200).json({ message: 'You are allowed to connect to letterbox mailing relay service' });
})

// --- SEND EMAIL ROUTE ---
app.post('/send', async (req, res) => {
  const { to, subject, fields, company } = req.body;

  if (isEmpty(to)) return res.status(400).json({ error: "missing 'to'" });
  if (isEmpty(subject)) return res.status(400).json({ error: "missing 'subject'" });
  if (isEmpty(fields) || typeof fields !== 'object') {
    return res.status(400).json({ error: "missing or invalid 'fields'" });
  }

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
      text: Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n'),
      html: generateEmailHTML(subject, fields, company),
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`letterbox running on port ${PORT}`));
