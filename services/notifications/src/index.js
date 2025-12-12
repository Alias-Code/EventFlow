require('dotenv').config();
const RabbitMQConsumer = require('./rabbitmq.consumer');
const createAPI = require('./api');

async function start() {
  try {
    // Démarrer l'API REST
    const app = createAPI();
    const PORT = process.env.PORT || 3003;
    
    app.listen(PORT, () => {
      console.log(`Notifications Service listening on port ${PORT}`);
    });

    // Démarrer le consumer RabbitMQ
    const consumer = new RabbitMQConsumer();
    await consumer.connect();
  } catch (error) {
    console.error('Service startup error:', error.message);
    process.exit(1);
  }
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

start();