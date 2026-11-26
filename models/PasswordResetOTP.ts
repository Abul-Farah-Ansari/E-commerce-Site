
import mongoose, {
  Schema,
  Document,
  Model,
  Types,
} from "mongoose";

export interface IPasswordResetOTP extends Document {
  userId: Types.ObjectId;
  email: string;
  role: "customer" | "admin";
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetOTPSchema =
  new Schema<IPasswordResetOTP>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      role: {
        type: String,
        enum: ["customer", "admin"],
        required: true,
      },

      otpHash: {
        type: String,
        required: true,
        select: false,
      },

      expiresAt: {
        type: Date,
        required: true,
      },

      attempts: {
        type: Number,
        default: 0,
        min: 0,
      },

      verified: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

// Automatically delete expired OTP records.
PasswordResetOTPSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const PasswordResetOTP: Model<IPasswordResetOTP> =
  mongoose.models.PasswordResetOTP ||
  mongoose.model<IPasswordResetOTP>(
    "PasswordResetOTP",
    PasswordResetOTPSchema
  );

export default PasswordResetOTP;
