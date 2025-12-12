require('dotenv').config();
const RabbitMQConsumer = require('./rabbitmq.consumer');
const createAPI = require('./api');

async function start() {
  console.log('🚀 Starting Notifications Service...\n');
  
  // Démarrer l'API REST
  const app = createAPI();
  const PORT = process.env.PORT || 3003;
  
  app.listen(PORT, () => {
    console.log(`📡 API listening on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Test: POST http://localhost:${PORT}/test`);
    console.log(`   Send: POST http://localhost:${PORT}/send\n`);
  });

  // Démarrer le consumer RabbitMQ
  const consumer = new RabbitMQConsumer();
  await consumer.connect();
  
  console.log('\n✅ Notifications Service is fully operational');
  console.log('📧 Email:', process.env.EMAIL_USER);
  console.log('🐰 RabbitMQ: Connected and listening');
  console.log('=' .repeat(50));
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Démarrage
start().catch(console.error);