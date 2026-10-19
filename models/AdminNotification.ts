
import mongoose, { Schema, type Model } from "mongoose";

/* =========================================================
   ADMIN NOTIFICATION TYPES
========================================================= */

export type AdminNotificationType =
  | "new_customer"
  | "new_order"
  | "order_status"
  | "payment_status"
  | "low_stock"
  | "customer_cancellation";

/* =========================================================
   ADMIN NOTIFICATION INTERFACE
========================================================= */

export interface IAdminNotification {
  type: AdminNotificationType;
  title: string;
  message: string;
  orderId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* =========================================================
   ADMIN NOTIFICATION SCHEMA
========================================================= */

const AdminNotificationSchema = new Schema<IAdminNotification>(
  {
    type: {
      type: String,
      enum: [
        "new_customer",
        "new_order",
        "order_status",
        "payment_status",
        "low_stock",
        "customer_cancellation",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: undefined,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   INDEXES
========================================================= */

AdminNotificationSchema.index({
  createdAt: -1,
});

/* =========================================================
   EXPORT MODEL
========================================================= */

const AdminNotification: Model<IAdminNotification> =
  (mongoose.models.AdminNotification as
    | Model<IAdminNotification>
    | undefined) ||
  mongoose.model<IAdminNotification>(
    "AdminNotification",
    AdminNotificationSchema
  );

export default AdminNotification;
