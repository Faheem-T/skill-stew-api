import type { AppEvent } from "@skillstew/common";
import type { ICohortService } from "../../application/interfaces/ICohortService";

export const paymentRefundedHandler =
  (cohortService: ICohortService) =>
  async (event: AppEvent<"payment.refunded">) => {
    await cohortService.handlePaymentRefunded(event.data);
    return { success: true };
  };
