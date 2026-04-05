import { PaymentSessionService } from "../application/services/PaymentSessionService";
import { PaymentSessionController } from "../presentation/controllers/PaymentSessionController";
import { ENV } from "../config/dotenv";

const EXCHANGE_NAME = "stew_exchange";

export let paymentSessionController: PaymentSessionController;

export async function initializePaymentsDependencies() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const amqp = require("amqplib");
  const connection = await amqp.connect(ENV.RABBIT_MQ_CONNECTION_STRING);
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

  const paymentSessionService = new PaymentSessionService(channel, EXCHANGE_NAME);
  paymentSessionController = new PaymentSessionController(paymentSessionService);
}
