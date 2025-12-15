export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface TicketBookedData {
  eventName: string;
  userName: string;
  userEmail: string;
  eventDate: string;
  eventLocation: string;
  ticketId: string;
}

export interface PaymentData {
  userName: string;
  userEmail: string;
  amount: number;
  transactionId: string;
}

export interface EventCancelledData {
  eventName: string;
  userName: string;
  userEmail: string;
  refundStatus: string;
}

const templates = {
  ticketBooked: (data: TicketBookedData): EmailTemplate => ({
    subject: `🎫 Confirmation - ${data.eventName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">🎫 EventFlow</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Réservation Confirmée</p>
          </div>
          
          <div style="padding: 40px; background: #f8f9fa;">
            <h2 style="color: #2d3748; margin-bottom: 20px;">Bonjour ${data.userName} 👋</h2>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              Nous sommes ravis de confirmer votre réservation !
            </p>
            
            <div style="background: white; padding: 25px; border-radius: 10px; margin: 30px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin-top: 0; font-size: 24px;">${data.eventName}</h3>
              <table style="width: 100%; margin-top: 20px;">
                <tr>
                  <td style="padding: 10px 0; color: #718096;">📅 Date</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #2d3748;">
                    ${new Date(data.eventDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    } as any)}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #718096;">📍 Lieu</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #2d3748;">${data.eventLocation}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #718096;">🎟️ Billet</td>
                  <td style="padding: 10px 0; font-weight: bold; color: #667eea; font-size: 18px;">${data.ticketId}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="http://localhost:3000/tickets/${data.ticketId}" 
                 style="background: #667eea; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Voir mon billet
              </a>
            </div>
            
            <div style="background: #edf2f7; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0; color: #4a5568; font-size: 14px;">
                💡 <strong>Conseil :</strong> Présentez ce billet à l'entrée de l'événement
              </p>
            </div>
          </div>
          
          <div style="background: #2d3748; color: white; padding: 30px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">Des questions ?</p>
            <p style="margin: 0; font-size: 12px; color: #cbd5e0;">
              Contactez-nous : support@eventflow.com
            </p>
            <p style="margin: 20px 0 0 0; font-size: 12px; color: #718096;">
              © 2025 EventFlow - Projet Architecture Logicielle
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  paymentSuccess: (data: PaymentData): EmailTemplate => ({
    subject: `✅ Paiement confirmé - ${data.amount}€`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0;">✅ Paiement Confirmé</h1>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2>Bonjour ${data.userName},</h2>
          <p>Votre paiement a été traité avec succès !</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Montant :</strong> ${data.amount}€</p>
            <p><strong>Transaction :</strong> ${data.transactionId}</p>
            <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
    `
  }),

  eventCancelled: (data: EventCancelledData): EmailTemplate => ({
    subject: `⚠️ URGENT - Annulation : ${data.eventName}`,
    html: `
      <header style="background: #ef4444; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">⚠️ Événement Annulé</h1>
      </header>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #f8f9fa;">
        <h2>Bonjour ${data.userName},</h2>
        <p style="color: #4a5568;">Nous regrettons de vous informer que l'événement suivant a été annulé :</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #ef4444;">
          <h3 style="margin-top: 0; color: #2d3748;">${data.eventName}</h3>
          <p style="margin: 10px 0;"><strong>Statut du remboursement :</strong> ${data.refundStatus}</p>
        </div>
        <p style="color: #4a5568;">Nous nous excusons pour ce désagrément. Pour toute question, contactez-nous.</p>
      </div>
    `
  }),

  paymentFailed: (data: PaymentData): EmailTemplate => ({
    subject: `❌ Paiement échoué - Action requise`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; color: white; padding: 40px; text-align: center;">
          <h1 style="margin: 0;">❌ Paiement Échoué</h1>
        </div>
        <div style="padding: 40px; background: #f8f9fa;">
          <h2>Bonjour ${data.userName},</h2>
          <p>Votre paiement n'a pas pu être traité.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #ef4444;">
            <p><strong>Montant :</strong> ${data.amount}€</p>
            <p><strong>Statut :</strong> Paiement refusé</p>
          </div>
          <p>Veuillez vérifier vos informations de paiement et réessayer.</p>
        </div>
      </div>
    `
  })
};

export default templates;
