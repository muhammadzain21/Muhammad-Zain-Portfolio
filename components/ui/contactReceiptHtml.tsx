export function contactFormNotificationHtml({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Contact Form Submission</title>
    </head>
    <body style="font-family: system-ui, -apple-system, Segoe UI, Arial; background-color: #ffffff; padding: 24px; color: #111;">
      <h2>📩 New Contact Form Submission</h2>
      <p>You have received a new message from your portfolio website:</p>

      <div style="background: #f6f6f6; padding: 16px; border-radius: 8px; margin-top: 16px;">
        <p style="margin: 0;"><strong>Name:</strong> ${escape(name)}</p>
        <p style="margin: 0;"><strong>Email:</strong> ${escape(email)}</p>
        <p style="margin: 0;"><strong>Subject:</strong> ${escape(subject)}</p>
        <p style="margin-top: 8px; white-space: pre-wrap;"><strong>Message:</strong><br/>${escape(message)}</p>
      </div>

      <p style="margin-top: 20px; font-size: 14px; color: #555;">
        This message was sent from your portfolio contact form.
      </p>
    </body>
    </html>
  `;
}

function escape(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
