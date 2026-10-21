
import mongoose, { Schema, type Model } from "mongoose";

export interface IHeroImage {
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
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
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
  { _id: true }
);

const HeroSettingsSchema = new Schema<IHeroSettings>(
  {
    images: {
      type: [HeroImageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const HeroSettings =
  (mongoose.models.HeroSettings as Model<IHeroSettings> | undefined) ??
  mongoose.model<IHeroSettings>("HeroSettings", HeroSettingsSchema);

export default HeroSettings;
