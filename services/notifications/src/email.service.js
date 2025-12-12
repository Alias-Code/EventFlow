const { TransactionalEmailsApi, ApiKeyAuth } = require('@getbrevo/brevo');
require('dotenv').config();

// Récupération de la Clé API Brevo
const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASSWORD; 

class EmailService {
    constructor() {
        if (!apiKey) {
            console.error('❌ Brevo API Key (BREVO_API_KEY ou SMTP_PASSWORD) est manquante.');
        }

        // Initialisation de l'API Brevo
        this.apiInstance = new TransactionalEmailsApi();
        // Configuration de la clé API
        this.apiInstance.authentications['apiKey'].apiKey = apiKey;

        this.verifyConnection();
    }
    
    verifyConnection() {
        // Nous utilisons l'email d'envoi comme indicateur que le service est prêt
        console.log('✅ Email service ready (API mode). Expéditeur:', process.env.EMAIL_FROM);
    }

    async sendEmail(to, subject, html) {
        // Assurez-vous d'utiliser EMAIL_FROM (votre adresse vérifiée)
        const sendSmtpEmail = {
            sender: {
                name: "EventFlow",
                email: process.env.EMAIL_FROM 
            },
            to: [{
                email: to,
                name: "Recipient"  // ✅ Brevo requiert un name non-vide
            }],
            subject: subject,
            htmlContent: html,
        };

        try {
            console.log(`📧 Envoi email à ${to}...`);
            console.log(`   From: ${process.env.EMAIL_FROM}`);
            console.log(`   Subject: ${subject}`);
            
            // Appel direct à l'API HTTP
            const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            
            // Structure correcte: data.body.messageId
            const messageId = data.body?.messageId || data.messageId || data.id || 'N/A';
            console.log(`✅ Email sent to ${to} - ID: ${messageId}`);
            return { success: true, messageId: messageId };

        } catch (error) {
            // Affichage des erreurs détaillées de l'API
            console.error(`❌ Email failed`);
            console.error(`   Status: ${error.status}`);
            console.error(`   Code: ${error.code}`);
            
            // Tenter d'extraire le message d'erreur Brevo
            if (error.response && error.response.body) {
                try {
                  const body = error.response.body;
                  console.error(`   Body Type: ${typeof body}`);
                  
                  if (typeof body === 'string') {
                    console.error(`   Error: ${body}`);
                  } else if (body.message) {
                    console.error(`   Error: ${body.message}`);
                  } else if (body.error) {
                    console.error(`   Error: ${body.error}`);
                  } else {
                    console.error(`   Body:`, body);
                  }
                } catch (e) {
                  console.error(`   Error parsing body: ${e.message}`);
                }
            } else if (error.response) {
              console.error(`   Response:`, error.response);
            } else {
                console.error(`   Error Message: ${error.message}`);
            }
            
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailService;