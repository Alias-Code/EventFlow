const express = require('express');
const EmailService = require('./email.service');
const templates = require('./templates');

function createAPI() {
  const app = express();
  const emailService = new EmailService();
  
  // Middleware pour parser JSON avec gestion d'erreurs
  app.use(express.json({ limit: '1mb' }));
  
  // Middleware pour logger les requêtes
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('   Body:', JSON.stringify(req.body).substring(0, 100));
    }
    next();
  });
  
  // Gestion des erreurs de parsing JSON
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      console.error('❌ JSON Parse Error:', err.message);
      return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'notifications',
      timestamp: new Date().toISOString()
    });
  });

  // Send test email
  app.post('/test', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const result = await emailService.sendEmail(
      email,
      '🧪 Test EventFlow',
      '<h1>Test Email</h1><p>If you receive this, the service is working!</p>'
    );

    res.json(result);
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