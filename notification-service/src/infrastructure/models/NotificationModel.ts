import mongoose from "mongoose";
import { NotificationType } from "../../domain/entities/NotificationType.enum";
import type { NotificationData } from "../../domain/entities/NotificationData";

export interface NotificationAttr {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  isRead: boolean;
}

export type NotificationDoc = NotificationAttr &
  mongoose.Document & { createdAt: Date };

const notificationSchema = new mongoose.Schema<NotificationDoc>(
  {
    recipientId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.statics.build = (attrs: NotificationAttr) => {
  return new NotificationModel(attrs);
};

interface NotificationModel extends mongoose.Model<NotificationDoc> {
  build: (attr: NotificationAttr) => NotificationDoc;
}

export const NotificationModel = mongoose.model<
  NotificationDoc,
  NotificationModel
>("Notification", notificationSchema);
