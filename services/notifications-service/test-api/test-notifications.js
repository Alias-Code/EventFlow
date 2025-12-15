import http from 'http';

const NOTIFICATIONS_SERVICE_URL = 'http://localhost:3003';

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(NOTIFICATIONS_SERVICE_URL + path);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testSendReservationEmail() {
  console.log('🚀 Démarrage du test - Envoi d\'email de réservation...\n');

  try {
    // Test 1: Health check
    console.log('✓ Test 1: Vérification de la santé du service...');
    const healthResponse = await makeRequest('GET', '/health');
    console.log(`  Réponse: ${JSON.stringify(healthResponse.data)}\n`);

    // Test 2: Envoi d'email de réservation avec template
    console.log('✓ Test 2: Envoi d\'email de réservation (avec template)...');
    
    const reservationData = {
      type: 'ticketBooked',
      data: {
        eventName: 'Concert - Coldplay',
        userName: 'Anas Mougammadou',
        userEmail: 'mougammadou.anas@gmail.com',
        eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        eventLocation: 'Stade de France, Paris',
        ticketId: 'TKT-' + Math.random().toString(36).substring(2, 11).toUpperCase()
      }
    };

    const sendResponse = await makeRequest('POST', '/send', reservationData);
    
    if (sendResponse.status === 200 && sendResponse.data.success) {
      console.log(`  ✅ Email envoyé avec succès!`);
      console.log(`  Message ID: ${sendResponse.data.messageId}`);
      console.log(`  À: ${reservationData.data.userEmail}`);
      console.log(`  Sujet: 🎫 Confirmation - ${reservationData.data.eventName}\n`);
    } else {
      console.log(`  ❌ Erreur lors de l'envoi:`);
      console.log(`  ${sendResponse.data.error || 'Erreur inconnue'}\n`);
    }

    // Test 3: Envoi d'email simple (custom)
    console.log('✓ Test 3: Envoi d\'email simple (custom)...');
    
    const customEmailData = {
      to: 'mougammadou.anas@gmail.com',
      subject: '🎉 Bienvenue sur EventFlow!',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #667eea; color: white; padding: 30px; text-align: center;">
              <h1>Bienvenue sur EventFlow! 🎉</h1>
            </div>
            <div style="padding: 30px; background: #f8f9fa;">
              <p>Bonjour Anas,</p>
              <p>Nous sommes ravi de vous accueillir sur notre plateforme EventFlow.</p>
              <p>Vous pouvez maintenant découvrir et réserver des événements près de chez vous!</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Explorer les événements
                </a>
              </p>
            </div>
            <div style="background: #2d3748; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p>© 2025 EventFlow</p>
            </div>
          </body>
        </html>
      `
    };

    const customResponse = await makeRequest('POST', '/send', customEmailData);
    
    if (customResponse.status === 200 && customResponse.data.success) {
      console.log(`  ✅ Email custom envoyé avec succès!`);
      console.log(`  Message ID: ${customResponse.data.messageId}`);
      console.log(`  À: ${customEmailData.to}\n`);
    } else {
      console.log(`  ❌ Erreur lors de l'envoi:`);
      console.log(`  ${customResponse.data.error || 'Erreur inconnue'}\n`);
    }

    console.log('✨ Tous les tests sont terminés!\n');

  } catch (error) {
    console.error('❌ Erreur lors des tests:');
    console.error(error.message);
    process.exit(1);
  }
}

// Lancer les tests
testSendReservationEmail();
