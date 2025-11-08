/*
    Helpers for building HTML
*/
const { isEmpty } = require("./validation");

// Generate a simple HTML email template
function generateEmailHTML(subject, text, company = {}) {
    const { name, address, phone } = company;

    return `
  <div style="font-family: 'Noto Sans', sans-serif; background-color: #0E0C14; padding: 32px; color: #E8E8E9;">
    <div style="max-width: 600px; background: #1A1625; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <div style="background-color: #00c8bc; color: #1A1625; padding: 24px;">
        <h2 style="margin: 0; font-size: 24px; font-weight: 500;">${subject}</h2>
      </div>
      <div style="padding: 24px; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
        ${text}
      </div>
      ${
        !isEmpty(company)
            ? `<div style="background-color: #252230; padding: 16px 24px; font-size: 14px; color: #8CE6E1;">
              <strong>${name || ''}</strong><br>
              ${address ? `${address}<br>` : ''}
              ${phone ? `Phone: ${phone}` : ''}
            </div>`
            : ''
    }
    </div>
    <p style="text-align: center; color: #53535E; font-size: 12px; margin-top: 20px;">
      Sent via Letterbox Mailer
    </p>
  </div>
  `;
}


function generateLandingPageHTML() {
    return `
    <html>
      <head>
        <title>Letterbox Mailer</title>
        <style>
          body {
            font-family: 'Noto Sans', sans-serif;
            background-color: #0E0C14;
            color: #E8E8E9;
            text-align: center;
            margin: 0;
            padding: 100px 20px;
          }
          h1 {
            color: #00c8bc;
            font-family: 'Ubuntu', sans-serif;
            font-size: 36px;
            font-weight: 500;
            margin-bottom: 16px;
          }
          p {
            color: #8CE6E1;
            font-size: 16px;
            line-height: 1.6;
            margin: 8px 0;
          }
          code {
            background: #252230;
            color: #E6FAF8;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <h1>📮 Letterbox Mailer</h1>
        <p>Your email relay server is running.</p>
        <p>If you can see this page, then your IP is whitelisted</p>
        <p>Use <code>POST /send</code> to send emails.</p>
      </body>
    </html>
  `;
}


module.exports = { generateEmailHTML, generateLandingPageHTML };
