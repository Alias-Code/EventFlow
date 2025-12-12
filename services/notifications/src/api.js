const express = require('express');
const EmailService = require('./email.service');
const templates = require('./templates');

function createAPI() {
  const app = express();
  const emailService = new EmailService();
  
  app.use(express.json({ limit: '1mb' }));
  
  // Gestion des erreurs de parsing JSON
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'notifications'
    });
  });

  // Send notification manually
  app.post('/send', async (req, res) => {
    const { type, data, to, subject, html } = req.body;
    
    try {
      // Mode 1: Requête simple (to, subject, html)
      if (to && subject && html) {
        const result = await emailService.sendEmail(to, subject, html);
        return res.json(result);
      }
      
      // Mode 2: Requête avec template (type + data)
      if (!type || !data) {
        return res.status(400).json({ 
          error: 'Invalid request. Provide either (to, subject, html) or (type, data)' 
        });
      }

      let template;
      switch(type) {
        case 'ticketBooked':
          template = templates.ticketBooked(data);
          break;
        case 'paymentSuccess':
          template = templates.paymentSuccess(data);
          break;
        case 'eventCancelled':
          template = templates.eventCancelled(data);
          break;
        case 'paymentFailed':
          template = templates.paymentFailed(data);
          break;
        default:
          return res.status(400).json({ 
            error: 'Invalid notification type. Use: ticketBooked, paymentSuccess, eventCancelled, paymentFailed' 
          });
      }

      const result = await emailService.sendEmail(
        data.userEmail,
        template.subject,
        template.html
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}

module.exports = createAPI;