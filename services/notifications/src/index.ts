import 'dotenv/config';
import RabbitMQConsumer from './rabbitmq.consumer.js';
import createAPI from './api.js';

async function start(): Promise<void> {
  try {
    // Start REST API
    const app = createAPI();
    const PORT = process.env.PORT || 3003;
    
    app.listen(PORT, () => {
      console.log(`Notifications Service listening on port ${PORT}`);
    });

    // Start RabbitMQ consumer
    const consumer = new RabbitMQConsumer();
    await consumer.connect();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Service startup error:', errorMessage);
    process.exit(1);
  }
}

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

start();
