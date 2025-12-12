const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
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

    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service ready:', process.env.EMAIL_USER);
    } catch (error) {
      console.error('❌ Email service error:', error.message);
    }
  }

  async sendEmail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: `"EventFlow" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html,
        text: html.replace(/<[^>]*>/g, '')
      });

      console.log(`✅ Email sent to ${to} - ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Email failed:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;