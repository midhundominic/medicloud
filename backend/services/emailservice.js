const nodemailer = require('nodemailer');

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other email services too
  auth: {
    user: 'midhundominic2025@mca.ajce.in', 
    pass: 'NVS@1970',  // Replace with your email password or App password (for 2FA)
  },
});

// Send email function
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: 'midhundominic2025@mca.ajce.in', // Sender's email
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = { sendEmail };
