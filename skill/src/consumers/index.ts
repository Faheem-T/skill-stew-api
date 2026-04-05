import type { IEventConsumer } from "../application/ports/IEventConsumer";
import type { ICohortService } from "../application/interfaces/ICohortService";
import type { ILogger } from "../application/ports/ILogger";
import { paymentFailedHandler } from "./handlers/paymentFailed.handler";
import { paymentRefundedHandler } from "./handlers/paymentRefunded.handler";
import { paymentSucceededHandler } from "./handlers/paymentSucceeded.handler";

export async function setupEventHandlers(
  eventConsumer: IEventConsumer,
  cohortService: ICohortService,
  logger: ILogger,
) {
  await eventConsumer.registerHandler(
    "payment.succeeded",
    paymentSucceededHandler(cohortService),
  );
  await eventConsumer.registerHandler(
    "payment.failed",
    paymentFailedHandler(cohortService),
  );
  await eventConsumer.registerHandler(
    "payment.refunded",
    paymentRefundedHandler(cohortService),
  );

  logger.info("Skill RabbitMQ event consumer set up successfully");
}
