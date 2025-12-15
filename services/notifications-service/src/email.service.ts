import { TransactionalEmailsApi } from '@getbrevo/brevo';
import 'dotenv/config';

const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASSWORD;

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private apiInstance: TransactionalEmailsApi;

  constructor() {
    if (!apiKey) {
      throw new Error('BREVO_API_KEY environment variable is required');
    }

    this.apiInstance = new TransactionalEmailsApi();
    // @ts-ignore - Protected property access for Brevo API configuration
    this.apiInstance.authentications['apiKey'].apiKey = apiKey;
  }

  async sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
    const sendSmtpEmail = {
      sender: {
        name: 'EventFlow',
        email: process.env.EMAIL_FROM || 'noreply@eventflow.com'
      },
      to: [{
        email: to,
        name: 'Recipient'
      }],
      subject: subject,
      htmlContent: html,
    };

    try {
      const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      const messageId = (data.body as any)?.messageId || (data as any).messageId || (data as any).id;
      
      return { success: true, messageId: messageId };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Email failed for ${to}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

export default EmailService;
