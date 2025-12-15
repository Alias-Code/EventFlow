import http from 'http';

const TICKETS_SERVICE_URL = 'http://localhost:3003';

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(TICKETS_SERVICE_URL + path);
    
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

async function testTicketsService() {
  console.log('🎫 Démarrage des tests - Tickets Service...\n');

  try {
    // Test 1: Créer une réservation
    console.log('✓ Test 1: Créer une réservation de ticket...');
    
    const reserveData = {
      userId: 'user-123',
      eventId: 'event-456'
    };

    const reserveResponse = await makeRequest('POST', '/tickets', reserveData);
    
    if (reserveResponse.status === 201) {
      const ticket = reserveResponse.data;
      console.log(`  ✅ Ticket créé avec succès!`);
      console.log(`  ID: ${ticket.id}`);
      console.log(`  Utilisateur: ${ticket.userId}`);
      console.log(`  Événement: ${ticket.eventId}`);
      console.log(`  Status: ${ticket.status}`);
      console.log(`  Date de création: ${ticket.createdAt}\n`);
      
      // Test 2: Annuler la réservation
      console.log('✓ Test 2: Annuler une réservation de ticket...');
      
      const cancelData = {
        ticketId: ticket.id
      };

      const cancelResponse = await makeRequest('POST', '/tickets/cancel', cancelData);
      
      if (cancelResponse.status === 200) {
        const cancelledTicket = cancelResponse.data;
        console.log(`  ✅ Ticket annulé avec succès!`);
        console.log(`  ID: ${cancelledTicket.id}`);
        console.log(`  Nouveau status: ${cancelledTicket.status}\n`);
      } else {
        console.log(`  ⚠️ Erreur lors de l'annulation:`);
        console.log(`  Status: ${cancelResponse.status}`);
        console.log(`  ${JSON.stringify(cancelResponse.data)}\n`);
      }
    } else {
      console.log(`  ❌ Erreur lors de la création:`);
      console.log(`  Status: ${reserveResponse.status}`);
      console.log(`  ${JSON.stringify(reserveResponse.data)}\n`);
    }

    // Test 3: Créer plusieurs tickets pour un test de charge
    console.log('✓ Test 3: Créer 5 tickets en parallèle (test de charge)...');
    
    const ticketPromises = [];
    for (let i = 0; i < 5; i++) {
      const data = {
        userId: `user-${100 + i}`,
        eventId: 'event-789'
      };
      ticketPromises.push(makeRequest('POST', '/tickets', data));
    }

    const results = await Promise.all(ticketPromises);
    const successCount = results.filter(r => r.status === 201).length;
    console.log(`  ✅ ${successCount}/5 tickets créés avec succès\n`);

    console.log('✨ Tous les tests sont terminés!\n');

  } catch (error) {
    console.error('❌ Erreur lors des tests:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Lancer les tests
testTicketsService();
