import nodemailer from 'nodemailer';

// Create email transporter
function createTransporter() {
  // Check if using Gmail
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log('[email] Configuring Gmail transporter');
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  
  // Check if using custom SMTP
  if (process.env.SMTP_HOST) {
    console.log('[email] Configuring custom SMTP transporter');
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  
  // Development fallback: Use Ethereal Email (fake SMTP for testing)
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[email] No email configuration found. Using Ethereal (test email) for development.');
    return 'ethereal'; // Special flag to create test account
  }
  
  console.warn('[email] No email configuration found. Emails will not be sent.');
  return null;
}

const transporter = createTransporter();

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<boolean>} - True if email was sent successfully
 */
export async function sendPasswordResetEmail(to, resetToken) {
  let emailTransporter = transporter;
  
  // If no transporter configured, create a test account for development
  if (!emailTransporter || emailTransporter === 'ethereal') {
    console.log('[email] Creating test email account (Ethereal) for development...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      emailTransporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('[email] ✅ Test email account created:', testAccount.user);
    } catch (error) {
      console.error('[email] Failed to create test account:', error.message);
      return false;
    }
  }
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Recycle App" <${process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@recycleapp.com'}>`,
    to,
    subject: 'Password Reset Request - Recycle App',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center;">
                    <h1 style="margin: 0; color: #111827; font-size: 28px; font-weight: 700;">
                      🔒 Password Reset Request
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    <p style="margin: 0 0 20px 0;">Hello,</p>
                    <p style="margin: 0 0 20px 0;">
                      You requested to reset your password for your Recycle App account. 
                      Click the button below to proceed:
                    </p>
                  </td>
                </tr>
                
                <!-- Button -->
                <tr>
                  <td align="center" style="padding: 0 40px 30px 40px;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; 
                              background-color: #1d4ed8; 
                              color: #ffffff; 
                              text-decoration: none; 
                              padding: 14px 32px; 
                              border-radius: 8px; 
                              font-weight: 700; 
                              font-size: 16px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
                
                <!-- Alternative Link -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    <p style="margin: 0 0 10px 0;">Or copy and paste this link into your browser:</p>
                    <p style="margin: 0; word-break: break-all; color: #1d4ed8;">
                      <a href="${resetUrl}" style="color: #1d4ed8; text-decoration: underline;">
                        ${resetUrl}
                      </a>
                    </p>
                  </td>
                </tr>
                
                <!-- Warning -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <div style="background-color: #fef2f2; 
                                border-left: 4px solid #dc2626; 
                                padding: 16px; 
                                border-radius: 8px;">
                      <p style="margin: 0; color: #dc2626; font-weight: 600; font-size: 14px;">
                        ⚠️ This link will expire in 30 minutes.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px 40px 40px; 
                             border-top: 1px solid #e5e7eb; 
                             color: #6b7280; 
                             font-size: 12px; 
                             line-height: 1.5;">
                    <p style="margin: 0 0 8px 0;">
                      If you didn't request this password reset, please ignore this email or contact support if you have concerns.
                    </p>
                    <p style="margin: 0; color: #9ca3af;">
                      © ${new Date().getFullYear()} Recycle App. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
Password Reset Request

You requested to reset your password for your Recycle App account.

Reset your password by visiting this link:
${resetUrl}

This link will expire in 30 minutes.

If you didn't request this password reset, please ignore this email.

© ${new Date().getFullYear()} Recycle App. All rights reserved.
    `.trim(),
  };
  
  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('[email] ✅ Password reset email sent:', {
      to,
      messageId: info.messageId,
    });
    
    // If using Ethereal (test email), log the preview URL
    if (emailTransporter.options?.host === 'smtp.ethereal.email') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('');
      console.log('📧 ========================================');
      console.log('📧 TEST EMAIL SENT!');
      console.log('📧 Preview URL: ' + previewUrl);
      console.log('📧 (Copy this URL to see the email)');
      console.log('📧 ========================================');
      console.log('');
    }
    
    return true;
  } catch (error) {
    console.error('[email] ❌ Failed to send password reset email:', {
      to,
      error: error.message,
      code: error.code,
    });
    return false;
  }
}

/**
 * Verify email service configuration
 * @returns {Promise<boolean>} - True if email service is properly configured
 */
export async function verifyEmailConfig() {
  if (!transporter) {
    console.warn('[email] No transporter configured');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('[email] Email service is ready');
    return true;
  } catch (error) {
    console.error('[email] Email service verification failed:', error.message);
    return false;
  }
}
