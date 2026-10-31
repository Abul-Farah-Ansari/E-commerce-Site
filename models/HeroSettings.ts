import mongoose, { Schema, type Model } from "mongoose";

export interface IHeroImage {
  // Desktop image
  desktopImageUrl?: string;
  desktopPublicId?: string;

  // Mobile image (optional)
  mobileImageUrl?: string;
  mobilePublicId?: string;

  // Legacy fields for backward compatibility
  imageUrl: string;
  publicId: string;

  altText: string;
  sortOrder: number;
}

export interface IHeroSettings {
  images: IHeroImage[];
  updatedAt?: Date;
}

const HeroImageSchema = new Schema<IHeroImage>(
  {
    // DESKTOP IMAGE

    desktopImageUrl: {
      type: String,
      trim: true,
    },

    desktopPublicId: {
      type: String,
      trim: true,
    },

    // MOBILE IMAGE

    mobileImageUrl: {
      type: String,
      trim: true,
      default: undefined,
    },

    mobilePublicId: {
      type: String,
      trim: true,
      default: undefined,
    },

    // LEGACY FIELDS
    // Keep these so existing storefront code continues working.

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
      trim: true,
    },

    // IMAGE DETAILS

    altText: {
      type: String,
      default: "House of Orive fashion collection",
      trim: true,
      maxlength: 200,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

const HeroSettingsSchema = new Schema<IHeroSettings>(
  {
    images: {
      type: [HeroImageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const HeroSettings =
  (mongoose.models.HeroSettings as
    | Model<IHeroSettings>
    | undefined) ??
  mongoose.model<IHeroSettings>(
    "HeroSettings",
    HeroSettingsSchema
  );

export default HeroSettings;