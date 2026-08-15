const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Sends an approval/rejection email to the employee who requested the leave
async function sendLeaveDecisionEmail({ to, name, leaveType, startDate, endDate, status, reason }) {
  const isApproved = status === 'approved';

  const subject = isApproved ? 'Your Leave Request Has Been Approved' : 'Your Leave Request Has Been Rejected';

  const text = isApproved
    ? `Hi ${name},\n\nGood news! Your leave request has been APPROVED:\n\n` +
      `  Leave Type: ${leaveType}\n  Dates: ${startDate} to ${endDate}\n\n` +
      `Enjoy your time off!\n\n— Leave Management System`
    : `Hi ${name},\n\nUnfortunately, your leave request has been REJECTED:\n\n` +
      `  Leave Type: ${leaveType}\n  Dates: ${startDate} to ${endDate}\n` +
      `  Reason: ${reason || 'No reason provided'}\n\n` +
      `Please contact your manager if you have any questions.\n\n— Leave Management System`;

  await transporter.sendMail({
    from: `Leave Management System <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  });
}

module.exports = { sendLeaveDecisionEmail };
