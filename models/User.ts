
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;

  role: "customer" | "admin";
  accountStatus: "active" | "disabled";

  // Email verification
  emailVerified: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;

  // Google sign-in
  googleId?: string;
  authProvider: "local" | "google" | "both";

  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  // Admin two-factor authentication (TOTP)
  totpEnabled?: boolean;
  totpSecretEncrypted?: string;
  totpPendingSecretEncrypted?: string;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    password: {
      type: String,
      required: function (this: IUser) {
        return this.authProvider !== "google";
      },
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
      required: true,
    },

    accountStatus: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      required: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationTokenHash: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "both"],
      default: "local",
      required: true,
    },

    address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    totpEnabled: {
      type: Boolean,
      default: false,
    },

    totpSecretEncrypted: {
      type: String,
      select: false,
    },

    totpPendingSecretEncrypted: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
