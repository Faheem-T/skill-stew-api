import mongoose from "mongoose";
import { v7 as uuidv7 } from "uuid";

export interface CohortAttr {
  _id: string;
  workshopId: string;
  expertId: string;
  workshopTitle: string;
  workshopBannerImageKey?: string | null;
  workshopTimezone: string;
  spotPriceAmount: number;
  currency: string;
  startDate: string;
  maxStudents: number;
  firstSessionStartsAt: Date;
  lastSessionStartsAt: Date;
}

export type CohortDoc = CohortAttr &
  mongoose.Document & {
    createdAt: Date;
    updatedAt: Date;
  };

interface CohortModel extends mongoose.Model<CohortDoc> {
  build: (attrs: CohortAttr) => CohortDoc;
}

const cohortSchema = new mongoose.Schema<CohortDoc>(
  {
    _id: {
      type: String,
      default: uuidv7,
    },
    workshopId: {
      type: String,
      required: true,
      index: true,
    },
    expertId: {
      type: String,
      required: true,
      index: true,
    },
    workshopTitle: {
      type: String,
      required: true,
    },
    workshopBannerImageKey: {
      type: String,
      default: null,
    },
    workshopTimezone: {
      type: String,
      required: true,
    },
    spotPriceAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    maxStudents: {
      type: Number,
      required: true,
    },
    firstSessionStartsAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastSessionStartsAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

cohortSchema.statics.build = (attrs: CohortAttr) => {
  return new CohortModel(attrs);
};

export const CohortModel = mongoose.model<CohortDoc, CohortModel>(
  "cohorts",
  cohortSchema,
);
