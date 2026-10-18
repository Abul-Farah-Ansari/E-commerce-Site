
import mongoose, { Schema, type Model } from "mongoose";

export interface IHomeVideo {
  title: string;
  description: string;
  videoUrl: string;
  publicId: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const HomeVideoSchema = new Schema<IHomeVideo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

HomeVideoSchema.index({
  isPublished: 1,
  sortOrder: 1,
  createdAt: -1,
});

const HomeVideo =
  (mongoose.models.HomeVideo as Model<IHomeVideo> | undefined) ??
  mongoose.model<IHomeVideo>("HomeVideo", HomeVideoSchema);

export default HomeVideo;
