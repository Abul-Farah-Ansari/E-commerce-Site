
import mongoose, { Document, Schema, models, model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  image?: string;
  status: "active" | "inactive";
  featured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    seoTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 70,
    },

    seoDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 170,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Category =
  models.Category || model<ICategory>("Category", categorySchema);

export default Category;
