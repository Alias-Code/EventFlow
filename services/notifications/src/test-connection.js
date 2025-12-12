require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing email connection...');
console.log('Account:', process.env.EMAIL_USER);

const transporter = nodemailer.createTransporter({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Connection failed:', error.message);
  } else {
    console.log('✅ Connection successful!');
  }
});