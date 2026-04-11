import { pgEnum } from "drizzle-orm/pg-core";
import { PaymentStatus } from "../../../domain/entities/PaymentStatus.enum";

export const paymentStatusEnum = pgEnum("payment_status", PaymentStatus);
