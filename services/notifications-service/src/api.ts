import express, { Express, Request, Response, NextFunction } from 'express';
import EmailService from './email.service.js';
import templates from './templates.js';

function createAPI(): Express {
  const app = express();
  const emailService = new EmailService();
  
  app.use(express.json({ limit: '1mb' }));
  
  // Gestion des erreurs de parsing JSON
  app.use((err: any, _req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
      res.status(400).json({ error: 'Invalid JSON in request body' });
      return;
    }
    next();
  });

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      service: 'notifications'
    });
  });

  // Send notification manually
  app.post('/send', async (req: Request, res: Response): Promise<Response | void> => {
    const { type, data, to, subject, html } = req.body;
    
    try {
      // Mode 1: Simple request (to, subject, html)
      if (to && subject && html) {
        const result = await emailService.sendEmail(to, subject, html);
        return res.json(result);
      }
      
      // Mode 2: Request with template (type + data)
      if (!type || !data) {
        return res.status(400).json({ 
          error: 'Invalid request. Provide either (to, subject, html) or (type, data)' 
        });
      }

      let emailTemplate;
      switch(type) {
        case 'ticketBooked':
          emailTemplate = templates.ticketBooked(data);
          break;
        case 'paymentSuccess':
          emailTemplate = templates.paymentSuccess(data);
          break;
        case 'eventCancelled':
          emailTemplate = templates.eventCancelled(data);
          break;
        case 'paymentFailed':
          emailTemplate = templates.paymentFailed(data);
          break;
        default:
          return res.status(400).json({ 
            error: 'Invalid notification type. Use: ticketBooked, paymentSuccess, eventCancelled, paymentFailed' 
          });
      }

      const result = await emailService.sendEmail(
        data.userEmail,
        emailTemplate.subject,
        emailTemplate.html
      );

      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: errorMessage });
    }
  });

  return app;
}

export default createAPI;
