import axios from "axios";
import { ExternalServiceError } from "../../application/errors/infra/ExternalServiceError";
import type {
  CheckoutSessionResponse,
  CreateCheckoutSessionInput,
  IPaymentsClient,
} from "../../application/ports/IPaymentsClient";

export class PaymentsClient implements IPaymentsClient {
  constructor(private baseUrl: string) {}

  async createCheckoutSession(
    input: CreateCheckoutSessionInput,
  ): Promise<CheckoutSessionResponse> {
    try {
      const response = await axios.post<{
        success: boolean;
        data: CheckoutSessionResponse;
      }>(
        new URL("/internal/payments/checkout-sessions", this.baseUrl).toString(),
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data.data;
    } catch (error) {
      throw new ExternalServiceError(
        "Failed to reach payments service.",
        error instanceof Error ? error : undefined,
      );
    }
  }
}
