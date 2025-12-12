const { TransactionalEmailsApi } = require('@getbrevo/brevo');
require('dotenv').config();

const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASSWORD;

class EmailService {
    constructor() {
        if (!apiKey) {
            throw new Error('BREVO_API_KEY environment variable is required');
        }

        this.apiInstance = new TransactionalEmailsApi();
        this.apiInstance.authentications['apiKey'].apiKey = apiKey;
    }

    async sendEmail(to, subject, html) {
        const sendSmtpEmail = {
            sender: {
                name: "EventFlow",
                email: process.env.EMAIL_FROM 
            },
            to: [{
                email: to,
                name: "Recipient"
            }],
            subject: subject,
            htmlContent: html,
        };

        try {
            const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            const messageId = data.body?.messageId || data.messageId || data.id;
            
            return { success: true, messageId: messageId };

        } catch (error) {
            console.error(`❌ Email failed for ${to}:`, error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailService;