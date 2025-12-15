import amqp from "amqplib";

export class RabbitService {
  private static connection: any;
  private static channel: any;

  static async connect(url: string) {
    if (this.channel) return;

    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange("app.events", "topic", {
      durable: true,
    });

    console.log("[tickets-service] RabbitMQ connected");
  }

  static publish(routingKey: string, message: any) {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    this.channel.publish(
      "app.events",
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    console.log(`[tickets-service] Published → ${routingKey}`);
  }

  static async subscribe(
    routingKey: string,
    handler: (data: any) => Promise<void> | void
  ) {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }

    const q = await this.channel.assertQueue("", { exclusive: true });
    await this.channel.bindQueue(q.queue, "app.events", routingKey);

    this.channel.consume(q.queue, async (msg: any) => {
      if (!msg) return;

      try {
        const data = JSON.parse(msg.content.toString());
        await handler(data);
        this.channel.ack(msg);
      } catch (err) {
        console.error("[tickets-service] Error handling event", err);
        this.channel.nack(msg, false, true);
      }
    });

    console.log(`[tickets-service] Subscribed to ${routingKey}`);
  }
}
