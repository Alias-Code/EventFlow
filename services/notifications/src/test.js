require('dotenv').config();
const amqp = require('amqplib');

async function publishTestEvent(type, data) {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672');
  const channel = await connection.createChannel();
  
  await channel.assertExchange('eventflow.events', 'topic', { durable: true });
  
  const message = {
    type: type,
    payload: data,
    timestamp: new Date().toISOString()
  };
  
  const routingKey = type.replace(/([A-Z])/g, '.new $1').toLowerCase().trim();
  
  channel.publish(
    'eventflow.events',
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  
  console.log(`✅ Published ${type} event`);
  await connection.close();
}

async function runTests() {
  console.log('🧪 EventFlow Notifications - Test Suite\n');
  
  const testEmail = 'test@example.com'; 
  
  // Test 1: Ticket booked
  console.log('Test 1: Sending ticket booking...');
  await publishTestEvent('ticket.booked', {
    userEmail: testEmail,
    userName: 'John Doe',
    eventName: 'Concert Rock 2024',
    eventDate: '2024-03-15T20:00:00',
    eventLocation: 'Zénith de Paris',
    ticketId: 'TICKET-' + Date.now()
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Test 2: Payment success
  console.log('Test 2: Sending payment success...');
  await publishTestEvent('payment.processed', {
    userEmail: testEmail,
    userName: 'John Doe',
    amount: 49.99,
    transactionId: 'TRX-' + Date.now()
  });
  
  console.log('\n✅ Tests completed! Check your email.');
}

runTests().catch(console.error);