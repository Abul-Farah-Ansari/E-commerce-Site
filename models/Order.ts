
import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

/**
 * A normalized shipment event saved from Shiprocket tracking updates.
 */
export interface IShipmentEvent {
  status: string;
  statusCode?: string;
  location?: string;
  description?: string;
  eventDate?: Date;
}

export interface IParcelDetails {
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;

  items: IOrderItem[];

  customer: {
    name: string;
    email: string;
    phone: string;
  };

  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };

  deliveryMethod: string;

  /*
  |--------------------------------------------------------------------------
  | PAYMENT METHOD
  |--------------------------------------------------------------------------
  */
  paymentMethod: "cod" | "online";

  /*
  |--------------------------------------------------------------------------
  | PAYMENT STATUS
  |--------------------------------------------------------------------------
  */
  paymentStatus: "pending" | "paid" | "failed";

  /*
  |--------------------------------------------------------------------------
  | RAZORPAY PAYMENT DETAILS
  |--------------------------------------------------------------------------
  */
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  /*
  |--------------------------------------------------------------------------
  | ORDER STATUS
  |--------------------------------------------------------------------------
  */
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

  /*
  |--------------------------------------------------------------------------
  | SHIPROCKET SHIPMENT DETAILS
  |--------------------------------------------------------------------------
  */
  shiprocketOrderReference?: string;
  shiprocketCreateInProgress?: boolean;
  parcelDetails?: IParcelDetails;

  shiprocketOrderId?: number;
  shiprocketShipmentId?: number;

  awbCode?: string;
  courierCompanyId?: number;
  courierName?: string;
  trackingUrl?: string;

  shipmentStatus?: string;
  shipmentStatusCode?: string;

  pickupScheduledAt?: Date;
  pickupTokenNumber?: string;
  shipmentCreatedAt?: Date;

  shipmentEvents?: IShipmentEvent[];

  /*
  |--------------------------------------------------------------------------
  | SHIPROCKET SHIPPING LABEL
  |--------------------------------------------------------------------------
  */
  shippingLabelUrl?: string;
  shippingLabelGeneratedAt?: Date;

  /*
  |--------------------------------------------------------------------------
  | SHIPROCKET MANIFEST
  |--------------------------------------------------------------------------
  */
  shiprocketManifestId?: number;
  manifestUrl?: string;
  manifestGeneratedAt?: Date;

  /*
  |--------------------------------------------------------------------------
  | PRICE
  |--------------------------------------------------------------------------
  */
  subtotal: number;
  shipping: number;
  total: number;

  createdAt: Date;
  updatedAt: Date;
}

/*
|--------------------------------------------------------------------------
| ORDER ITEM SCHEMA
|--------------------------------------------------------------------------
*/

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      default: "",
    },

    size: {
      type: String,
      default: undefined,
    },

    color: {
      type: String,
      default: undefined,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| SHIPMENT EVENT SCHEMA
|--------------------------------------------------------------------------
*/

const ShipmentEventSchema = new Schema<IShipmentEvent>(
  {
    status: {
      type: String,
      required: true,
      trim: true,
    },

    statusCode: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    eventDate: {
      type: Date,
      default: undefined,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| PARCEL DETAILS SCHEMA
|--------------------------------------------------------------------------
*/

const ParcelDetailsSchema = new Schema<IParcelDetails>(
  {
    length: {
      type: Number,
      required: true,
      min: 0.6,
    },

    breadth: {
      type: Number,
      required: true,
      min: 0.6,
    },

    height: {
      type: Number,
      required: true,
      min: 0.6,
    },

    weight: {
      type: Number,
      required: true,
      min: 0.01,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| ORDER SCHEMA
|--------------------------------------------------------------------------
*/

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,

      validate: {
        validator: function (items: IOrderItem[]) {
          return items.length > 0;
        },

        message: "Order must contain at least one item.",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER INFORMATION
    |--------------------------------------------------------------------------
    */
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | SHIPPING ADDRESS
    |--------------------------------------------------------------------------
    */
    shippingAddress: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pincode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    deliveryMethod: {
      type: String,
      required: true,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT
    |--------------------------------------------------------------------------
    */
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    /*
    |--------------------------------------------------------------------------
    | RAZORPAY
    |--------------------------------------------------------------------------
    */
    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | HOUSE OF ORIVE ORDER STATUS
    |--------------------------------------------------------------------------
    */
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    /*
    |--------------------------------------------------------------------------
    | SHIPROCKET ORDER / SHIPMENT REFERENCES
    |--------------------------------------------------------------------------
    */
    shiprocketOrderReference: {
      type: String,
      default: "",
      trim: true,
    },

    shiprocketCreateInProgress: {
      type: Boolean,
      default: false,
    },

    parcelDetails: {
      type: ParcelDetailsSchema,
      default: undefined,
    },

    shiprocketOrderId: {
      type: Number,
      default: undefined,
      index: true,
    },

    shiprocketShipmentId: {
      type: Number,
      default: undefined,
      index: true,
    },

    awbCode: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    courierCompanyId: {
      type: Number,
      default: undefined,
    },

    courierName: {
      type: String,
      default: "",
      trim: true,
    },

    trackingUrl: {
      type: String,
      default: "",
      trim: true,
    },

    shipmentStatus: {
      type: String,
      default: "",
      trim: true,
    },

    shipmentStatusCode: {
      type: String,
      default: "",
      trim: true,
    },

    pickupScheduledAt: {
      type: Date,
      default: undefined,
    },

    pickupTokenNumber: {
      type: String,
      default: "",
      trim: true,
    },

    shipmentCreatedAt: {
      type: Date,
      default: undefined,
    },

    shipmentEvents: {
      type: [ShipmentEventSchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | SHIPROCKET SHIPPING LABEL
    |--------------------------------------------------------------------------
    */
    shippingLabelUrl: {
      type: String,
      default: "",
      trim: true,
    },

    shippingLabelGeneratedAt: {
      type: Date,
      default: undefined,
    },

    /*
    |--------------------------------------------------------------------------
    | SHIPROCKET MANIFEST
    |--------------------------------------------------------------------------
    */
    shiprocketManifestId: {
      type: Number,
      default: undefined,
    },

    manifestUrl: {
      type: String,
      default: "",
      trim: true,
    },

    manifestGeneratedAt: {
      type: Date,
      default: undefined,
    },

    /*
    |--------------------------------------------------------------------------
    | PRICE
    |--------------------------------------------------------------------------
    */
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shipping: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Order: Model<IOrder> =
  mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
