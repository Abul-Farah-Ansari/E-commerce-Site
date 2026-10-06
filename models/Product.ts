import mongoose, {
  Schema,
  Document,
  Model,
  Types,
} from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;

  category: Types.ObjectId;

  price: number;
  compareAtPrice?: number;

  images: string[];

  sizes: string[];
  colors: string[];

  sku: string;

  stock: number;
  lowStockThreshold: number;

  status:
    | "active"
    | "draft"
    | "out_of_stock";

  // Product sections
  featured: boolean;
  newArrival: boolean;
  trending: boolean;
  sale: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
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
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
    },

    images: {
      type: [String],
      default: [],
    },

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      required: true,
      default: 5,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "active",
        "draft",
        "out_of_stock",
      ],
      default: "draft",
      required: true,
    },

    /*
    ============================================================
    PRODUCT SECTIONS
    ============================================================
    */

    // Best Sellers
    featured: {
      type: Boolean,
      default: false,
    },

    // New Arrivals
    newArrival: {
      type: Boolean,
      default: false,
    },

    // Trending
    trending: {
      type: Boolean,
      default: false,
    },

    // Sale
    sale: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>(
    "Product",
    ProductSchema
  );

export default Product;