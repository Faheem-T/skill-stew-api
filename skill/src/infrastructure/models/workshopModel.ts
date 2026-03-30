import mongoose from "mongoose";
import { v7 as uuidv7 } from "uuid";
import { WorkshopStatus } from "../../domain/entities/WorkshopStatus.enum.ts";

export interface WorkshopSessionAttr {
  _id: string;
  weekNumber: number;
  dayOfWeek: number;
  sessionOrder: number;
  title?: string | null;
  description?: string | null;
  startTime: string;
}

export interface WorkshopAttr {
  _id: string;
  expertId: string;
  title: string;
  description?: string | null;
  targetAudience?: string | null;
  bannerImageKey?: string | null;
  maxCohortSize: number;
  status: WorkshopStatus;
  sessions: WorkshopSessionAttr[];
  timezone?: string | null;
}

export type WorkshopDoc = WorkshopAttr &
  mongoose.Document & {
    createdAt: Date;
    updatedAt: Date;
  };

interface WorkshopModel extends mongoose.Model<WorkshopDoc> {
  build: (attrs: WorkshopAttr) => WorkshopDoc;
}

const workshopSessionSchema = new mongoose.Schema<WorkshopSessionAttr>(
  {
    _id: {
      type: String,
      default: uuidv7,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
    },
    sessionOrder: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    startTime: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const workshopSchema = new mongoose.Schema<WorkshopDoc>(
  {
    _id: {
      type: String,
      default: uuidv7,
    },
    expertId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    targetAudience: {
      type: String,
      default: null,
    },
    bannerImageKey: {
      type: String,
      default: null,
    },
    maxCohortSize: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: WorkshopStatus,
      default: "draft",
    },
    sessions: {
      type: [workshopSessionSchema],
      default: [],
    },
    timezone: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

workshopSchema.statics.build = (attrs: WorkshopAttr) => {
  return new WorkshopModel(attrs);
};

export const WorkshopModel = mongoose.model<WorkshopDoc, WorkshopModel>(
  "workshops",
  workshopSchema,
);
