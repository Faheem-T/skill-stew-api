import mongoose from "mongoose";
import { OutboxEventStatus } from "../enums/OutboxEventStatus.enum";

export interface OutboxEventDoc extends mongoose.Document {
  _id: string;
  event_name: string;
  payload: unknown;
  status: (typeof OutboxEventStatus)[number];
  created_at: Date;
  processed_at?: Date | null;
}

const outboxEventSchema = new mongoose.Schema<OutboxEventDoc>({
  _id: { type: String, required: true },
  event_name: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: OutboxEventStatus,
    required: true,
  },
  created_at: { type: Date, required: true },
  processed_at: { type: Date, default: null },
});

export const OutboxEventModel = mongoose.model<OutboxEventDoc>(
  "outbox_events",
  outboxEventSchema,
);
