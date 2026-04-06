import type { AppEvent } from "@skillstew/common";
import type { ICohortService } from "../../application/interfaces/ICohortService";

export const paymentFailedHandler =
  (cohortService: ICohortService) =>
  async (event: AppEvent<"payment.failed">) => {
    await cohortService.handlePaymentFailed(event.data);
    return { success: true };
  };
