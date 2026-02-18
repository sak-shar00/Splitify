const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}); 

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendGroupInviteEmail = async (email, inviterName, groupName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Group Invitation - Expense Splitter',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Group Invitation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 40px 10px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                <tr>
                  <td align="center" style="padding: 40px 30px 20px 30px;">
                    <h2 style="margin: 0; color: #333;">You're Invited! 🎉</h2>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding: 0 30px 20px 30px; color: #555; font-size: 16px; line-height: 1.5;">
                    <p style="margin: 0;">Hi,</p>
                    <p style="margin-top: 10px;">${inviterName} has invited you to join the group "${groupName}" on Expense Splitter.</p>
                    <p style="margin-top: 10px;">Log in to your account to accept or reject this invitation.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px 30px 40px 30px; font-size: 12px; color: #999;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Expense Splitter. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification - Expense Splitter',
    html: `
        <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Email Verification</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, sans-serif;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center" style="padding: 40px 10px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                    <tr>
                      <td align="center" style="padding: 40px 30px 20px 30px;">
                        <h2 style="margin: 0; color: #333;">Welcome to Expense Splitter 🎉</h2>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="padding: 0 30px 20px 30px; color: #555; font-size: 16px; line-height: 1.5;">
                        <p style="margin: 0;">Hi ${name},</p>
                        <p style="margin-top: 10px;">Thanks for signing up! To get started, please verify your email address by entering the verification code below:</p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 20px 30px;">
                        <div style="display: inline-block; padding: 15px 25px; font-size: 24px; background-color: #4f46e5; color: #ffffff; border-radius: 6px; letter-spacing: 2px; font-weight: bold;">
                          ${otp}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="padding: 0 30px 20px 30px; color: #555; font-size: 14px; line-height: 1.5;">
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you didn't request this code, you can safely ignore this email.</p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 20px 30px 40px 30px; font-size: 12px; color: #999;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Expense Splitter. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendExpenseNotificationEmail = async (email, userName, payerName, expenseTitle, totalAmount, currency, userShare, groupName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'New Expense Added - Expense Splitter',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>New Expense</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 40px 10px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                <tr>
                  <td align="center" style="padding: 40px 30px 20px 30px;">
                    <h2 style="margin: 0; color: #333;">New Expense Added 💰</h2>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding: 0 30px 20px 30px; color: #555; font-size: 16px; line-height: 1.5;">
                    <p style="margin: 0;">Hi ${userName},</p>
                    <p style="margin-top: 10px;">${payerName} added a new expense "${expenseTitle}" in the group "${groupName}".</p>
                    <p style="margin-top: 10px;"><strong>Total Amount:</strong> ${currency} ${totalAmount.toFixed(2)}</p>
                    <p style="margin-top: 5px;"><strong>Your Share:</strong> ${currency} ${userShare.toFixed(2)}</p>
                    <p style="margin-top: 10px;">Log in to your account to view details and settle balances.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px 30px 40px 30px; font-size: 12px; color: #999;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Expense Splitter. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendSettlementEmail = async (email, userName, adminName, groupName, action, type) => {
  const isCreated = action === 'created';
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Settlement ${isCreated ? 'Created' : 'Completed'} - Expense Splitter`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Settlement ${isCreated ? 'Created' : 'Completed'}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" style="padding: 40px 10px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                <tr>
                  <td align="center" style="padding: 40px 30px 20px 30px;">
                    <h2 style="margin: 0; color: #333;">Settlement ${isCreated ? 'Created' : 'Completed'} ${isCreated ? '📊' : '✅'}</h2>
                  </td>
                </tr>
                <tr>
                  <td align="left" style="padding: 0 30px 20px 30px; color: #555; font-size: 16px; line-height: 1.5;">
                    <p style="margin: 0;">Hi ${userName},</p>
                    <p style="margin-top: 10px;">${isCreated ? `${adminName} has initiated a ${type} settlement for the group "${groupName}".` : `All dues for the group "${groupName}" have been settled successfully.`}</p>
                    <p style="margin-top: 10px;">Log in to your account to view ${isCreated ? 'settlement details and transaction breakdown' : 'the completed settlement'}.</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 20px 30px 40px 30px; font-size: 12px; color: #999;">
                    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Expense Splitter. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendGroupInviteEmail,
  sendExpenseNotificationEmail,
  sendSettlementEmail
};