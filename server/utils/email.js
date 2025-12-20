const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️  Email service not configured:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

/**
 * Send verification email to new user
 */
async function sendVerificationEmail(email, firstName, token) {
  console.log('[EMAIL] ----------------------------------------');
  console.log('[EMAIL] 📧 Preparing verification email...');
  console.log('[EMAIL] To:', email);
  console.log('[EMAIL] Recipient name:', firstName);
  console.log('[EMAIL] Token preview:', token.substring(0, 15) + '...');

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email.html?token=${token}`;
  console.log('[EMAIL] Verification URL:', verifyUrl);

  const mailOptions = {
    from: `"Vimmo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Bevestig je Vimmo account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #3d3530; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .logo { font-size: 32px; margin-bottom: 30px; }
          .logo .v { color: #d63031; }
          .logo .immo { color: #3d3530; font-weight: 800; }
          .button { display: inline-block; background: #c29b40; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo" style="text-align: center;">
            <span style="color: #d63031; font-weight: 400;">V</span> <span style="color: #3d3530; font-weight: 800;">IMMO</span>
          </div>
          
          <h2>Hallo ${firstName}! 👋</h2>
          
          <p>Bedankt voor je registratie bij Vimmo. Om je account te activeren, klik op de onderstaande knop:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" class="button">Bevestig mijn email</a>
          </div>
          
          <div style="background: #fdfaf3; border: 1px solid #e8e0c8; padding: 20px; border-radius: 12px; text-align: center;">
            <p style="color: #888; font-size: 14px; margin-bottom: 10px;">
              Werkt de knop niet? Kopieer en plak deze link in je browser:
            </p>
            <a href="${verifyUrl}" style="color: #c29b40; font-weight: 600; text-decoration: none; word-break: break-all;">${verifyUrl}</a>
          </div>
          
          <p>Deze link is 24 uur geldig.</p>
          
          <div class="footer">
            <p>Je ontvangt deze email omdat je een account hebt aangemaakt bij Vimmo.</p>
            <p>© 2024 Vimmo - Vind een plek die bij je past</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  console.log('[EMAIL] Email options prepared:');
  console.log('[EMAIL]   From:', mailOptions.from);
  console.log('[EMAIL]   Subject:', mailOptions.subject);

  try {
    console.log('[EMAIL] Attempting to send via SMTP...');
    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL] ✅ Email sent successfully!');
    console.log('[EMAIL] Message ID:', info.messageId);
    console.log('[EMAIL] Response:', info.response);
    console.log('[EMAIL] ----------------------------------------');
    return true;
  } catch (error) {
    console.error('[EMAIL] ❌ Failed to send email');
    console.error('[EMAIL] Error name:', error.name);
    console.error('[EMAIL] Error message:', error.message);
    console.error('[EMAIL] Error code:', error.code);
    if (error.responseCode) {
      console.error('[EMAIL] SMTP Response code:', error.responseCode);
    }
    console.error('[EMAIL] ----------------------------------------');
    return false;
  }
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, firstName, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

  const mailOptions = {
    from: `"Vimmo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Wachtwoord resetten - Vimmo',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #3d3530; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .logo { font-size: 32px; margin-bottom: 30px; }
          .logo .v { color: #d63031; }
          .logo .immo { color: #3d3530; font-weight: 800; }
          .button { display: inline-block; background: #c29b40; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo" style="text-align: center;">
            <span style="color: #d63031; font-weight: 400;">V</span> <span style="color: #3d3530; font-weight: 800;">IMMO</span>
          </div>
          
          <h2>Wachtwoord resetten</h2>
          
          <p>Hallo ${firstName},</p>
          
          <p>Je hebt een wachtwoord reset aangevraagd. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen:</p>
          
          <a href="${resetUrl}" class="button">Nieuw wachtwoord instellen</a>
          
          <p style="color: #888; font-size: 14px;">Of kopieer deze link naar je browser:<br>
          <a href="${resetUrl}" style="color: #c29b40;">${resetUrl}</a></p>
          
          <p>Deze link is 1 uur geldig. Als je geen wachtwoord reset hebt aangevraagd, kun je deze email negeren.</p>
          
          <div class="footer">
            <p>© 2024 Vimmo - Vind een plek die bij je past</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
