/*
    Helpers for building HTML
*/
const { isEmpty } = require("./validation");

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

function generateLandingPageHTML() {
    return `
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
    `
}

module.exports = { generateEmailHTML, generateLandingPageHTML };
