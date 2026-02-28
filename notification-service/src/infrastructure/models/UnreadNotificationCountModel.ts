import mongoose from "mongoose";
export interface UnreadNotificationCountAttr {
  userId: string;
  unreadCount: number;
}

export type UnreadNotificationCountDoc = UnreadNotificationCountAttr &
  mongoose.Document & { createdAt: Date };

const unreadNotificationCountSchema =
  new mongoose.Schema<UnreadNotificationCountDoc>(
    {
      userId: { type: String, required: true, index: true },
      unreadCount: {
        type: Number,
        required: true,
        min: [0, "Unread count cannot be less than 0"],
      },
    },
    { timestamps: true },
  );

unreadNotificationCountSchema.statics.build = (
  attrs: UnreadNotificationCountAttr,
) => {
  return new UnreadNotificationCountModel(attrs);
};

interface UnreadNotificationCountModel extends mongoose.Model<UnreadNotificationCountDoc> {
  build: (attr: UnreadNotificationCountAttr) => UnreadNotificationCountDoc;
}

export const UnreadNotificationCountModel = mongoose.model<
  UnreadNotificationCountDoc,
  UnreadNotificationCountModel
>("UnreadNotificationCount", unreadNotificationCountSchema);
