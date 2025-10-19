const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  if (process.env.SMTP_URL) {
    return nodemailer.createTransporter(process.env.SMTP_URL);
  }
  
  // Default configuration for development (using Gmail as example)
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@kleinpaket.com',
      to: email,
      subject: 'Password Reset - Kleinpaket Eligibility Checker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Password Reset Request</h2>
          <p>You requested a password reset for your Kleinpaket Eligibility Checker account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Kleinpaket Eligibility Checker<br>
            If the button doesn't work, copy and paste this link: ${resetUrl}
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

/**
 * Send team invitation email
 */
const sendTeamInvitationEmail = async (email, teamName, inviteToken) => {
  try {
    const transporter = createTransporter();
    const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/accept-invitation?token=${inviteToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@kleinpaket.com',
      to: email,
      subject: `Team Invitation - ${teamName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Team Invitation</h2>
          <p>You've been invited to join the team <strong>${teamName}</strong> on Kleinpaket Eligibility Checker.</p>
          <p>Click the button below to accept the invitation:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p>This invitation will expire in 7 days.</p>
          <p>If you don't want to join this team, you can ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Kleinpaket Eligibility Checker<br>
            If the button doesn't work, copy and paste this link: ${inviteUrl}
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Team invitation email sent to:', email);
  } catch (error) {
    console.error('Failed to send team invitation email:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendTeamInvitationEmail
};

