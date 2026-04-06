import type { AppEvent } from "@skillstew/common";
import type { ICohortService } from "../../application/interfaces/ICohortService";

export const paymentSucceededHandler =
  (cohortService: ICohortService) =>
  async (event: AppEvent<"payment.succeeded">) => {
    await cohortService.handlePaymentSucceeded(event.data);
    return { success: true };
  };
