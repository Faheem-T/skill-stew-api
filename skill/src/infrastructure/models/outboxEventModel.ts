import mongoose from "mongoose";
import { v7 as uuidv7 } from "uuid";
import { OutboxEventStatus } from "../../domain/entities/OutboxEventStatus.enum.ts";

export interface OutboxEventAttr {
  _id: string;
  event_name: string;
  payload: unknown;
  status: (typeof OutboxEventStatus)[number];
  created_at: Date;
  processed_at?: Date | null;
}

export type OutboxEventDoc = OutboxEventAttr & mongoose.Document;

interface OutboxEventModel extends mongoose.Model<OutboxEventDoc> {
  build: (attrs: OutboxEventAttr) => OutboxEventDoc;
}

const outboxEventSchema = new mongoose.Schema<OutboxEventDoc>({
  _id: {
    type: String,
    default: uuidv7,
  },
  event_name: {
    type: String,
    required: true,
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: OutboxEventStatus,
    default: "PENDING",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  processed_at: {
    type: Date,
    default: null,
  },
});

outboxEventSchema.statics.build = (attrs: OutboxEventAttr) => {
  return new OutboxEventModel(attrs);
};

export const OutboxEventModel = mongoose.model<OutboxEventDoc, OutboxEventModel>(
  "outbox_events",
  outboxEventSchema,
);
