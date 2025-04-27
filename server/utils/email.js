import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email sending function
export const sendMail = async ({ to, subject, text, html }) => {
  // Don't send emails in test environment
  if (process.env.NODE_ENV === 'test') {
    console.log('Email sending skipped in test environment');
    return true;
  }

  // Skip if email credentials are not set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials not set, skipping email send');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html: html || text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  welcome: (firstName) => ({
    subject: 'Welcome to Community Problem Reporting System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #2563EB;">Welcome to Community Problem Reporting System!</h1>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering with our community problem reporting system. You can now report problems in your community and help make it a better place to live.</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Submit new complaints</li>
          <li>Track the status of your complaints</li>
          <li>Receive updates on resolution progress</li>
          <li>Communicate with administrators</li>
        </ul>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The UrbanAssist Team</p>
      </div>
    `
  }),
  
  statusUpdate: (firstName, complaintId, title, status, comment) => ({
    subject: `Complaint Status Updated: ${complaintId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #2563EB;">Complaint Status Updated</h1>
        <p>Dear ${firstName},</p>
        <p>The status of your complaint has been updated:</p>
        <p><strong>Complaint ID:</strong> ${complaintId}</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>New Status:</strong> ${status}</p>
        ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ''}
        <p>You can view more details by logging into your account dashboard.</p>
        <p>Thank you for your patience.</p>
        <p>Best regards,<br>The UrbanAssist Team</p>
      </div>
    `
  }),
  
  newComment: (firstName, complaintId, title, comment) => ({
    subject: `New Comment on Your Complaint: ${complaintId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #2563EB;">New Comment on Your Complaint</h1>
        <p>Dear ${firstName},</p>
        <p>A new comment has been added to your complaint:</p>
        <p><strong>Complaint ID:</strong> ${complaintId}</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Comment:</strong> ${comment}</p>
        <p>You can log in to your account dashboard to respond or check for updates.</p>
        <p>Best regards,<br>The UrbanAssist Team</p>
      </div>
    `
  })
};

export default { sendMail, emailTemplates };