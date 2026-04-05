import mongoose from "mongoose";
import { v7 as uuidv7 } from "uuid";
import { CohortMembershipStatus } from "../../domain/entities/CohortMembershipStatus.enum.ts";

export interface CohortMembershipAttr {
  _id: string;
  cohortId: string;
  userId: string;
  paymentId?: string | null;
  status: (typeof CohortMembershipStatus)[number];
  joinedAt?: Date | null;
  expiresAt?: Date | null;
  lastPaymentEventAt?: Date | null;
}

export type CohortMembershipDoc = CohortMembershipAttr &
  mongoose.Document & {
    createdAt: Date;
    updatedAt: Date;
  };

interface CohortMembershipModel extends mongoose.Model<CohortMembershipDoc> {
  build: (attrs: CohortMembershipAttr) => CohortMembershipDoc;
}

const cohortMembershipSchema = new mongoose.Schema<CohortMembershipDoc>(
  {
    _id: {
      type: String,
      default: uuidv7,
    },
    cohortId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    paymentId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: CohortMembershipStatus,
      required: true,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastPaymentEventAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

cohortMembershipSchema.statics.build = (attrs: CohortMembershipAttr) => {
  return new CohortMembershipModel(attrs);
};

export const CohortMembershipModel = mongoose.model<
  CohortMembershipDoc,
  CohortMembershipModel
>("cohort_memberships", cohortMembershipSchema);
