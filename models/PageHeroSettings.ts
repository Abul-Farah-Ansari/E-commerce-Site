
import mongoose, { Schema, type Model } from "mongoose";

export const PAGE_HERO_SLUGS = [
  "products",
  "sale",
  "about",
  "contact",
] as const;

export type PageHeroSlug = (typeof PAGE_HERO_SLUGS)[number];

export interface IPageHeroSettings {
  page: PageHeroSlug;
  imageUrl: string;
  publicId: string;
  altText: string;
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  updatedAt?: Date;
  createdAt?: Date;
}

const PageHeroSettingsSchema = new Schema<IPageHeroSettings>(
  {
    page: {
      type: String,
      enum: PAGE_HERO_SLUGS,
      required: true,
      unique: true,
      index: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    publicId: {
      type: String,
      default: "",
      trim: true,
    },
    altText: {
      type: String,
      default: "House Of Orive collection",
      trim: true,
      maxlength: 200,
    },
    eyebrow: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    heading: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    buttonText: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
    buttonLink: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

const PageHeroSettings =
  (mongoose.models.PageHeroSettings as
    | Model<IPageHeroSettings>
    | undefined) ??
  mongoose.model<IPageHeroSettings>(
    "PageHeroSettings",
    PageHeroSettingsSchema
  );

export default PageHeroSettings;
