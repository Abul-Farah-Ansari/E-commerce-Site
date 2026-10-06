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
  |
  | cod    = Cash on Delivery
  | online = Online payment through Razorpay
  |
  */

  paymentMethod: "cod" | "online";

  /*
  |--------------------------------------------------------------------------
  | PAYMENT STATUS
  |--------------------------------------------------------------------------
  |
  | pending = Payment has not been completed yet
  | paid    = Payment successfully verified
  | failed  = Payment failed
  |
  */

  paymentStatus:
    | "pending"
    | "paid"
    | "failed";

  /*
  |--------------------------------------------------------------------------
  | RAZORPAY PAYMENT DETAILS
  |--------------------------------------------------------------------------
  |
  | These fields are only used for online payments.
  |
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
    /*
    |--------------------------------------------------------------------------
    | MongoDB Product ID
    |--------------------------------------------------------------------------
    |
    | Product IDs are MongoDB ObjectIds converted to strings
    | when stored inside an order.
    |
    */

    productId: {
      type: String,
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PRODUCT NAME
    |--------------------------------------------------------------------------
    */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PRODUCT PRICE
    |--------------------------------------------------------------------------
    */

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | QUANTITY
    |--------------------------------------------------------------------------
    */

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    /*
    |--------------------------------------------------------------------------
    | PRODUCT IMAGE
    |--------------------------------------------------------------------------
    */

    image: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | SIZE
    |--------------------------------------------------------------------------
    */

    size: {
      type: String,
      default: undefined,
    },

    /*
    |--------------------------------------------------------------------------
    | COLOR
    |--------------------------------------------------------------------------
    */

    color: {
      type: String,
      default: undefined,
    },
  },
  {
    /*
    | Order items don't need their own MongoDB _id.
    */
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
    /*
    |--------------------------------------------------------------------------
    | CUSTOMER USER
    |--------------------------------------------------------------------------
    */

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | ORDER ITEMS
    |--------------------------------------------------------------------------
    */

    items: {
      type: [OrderItemSchema],
      required: true,

      validate: {
        validator: function (
          items: IOrderItem[]
        ) {
          return items.length > 0;
        },

        message:
          "Order must contain at least one item.",
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

    /*
    |--------------------------------------------------------------------------
    | DELIVERY
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | PAYMENT STATUS
    |--------------------------------------------------------------------------
    */

    paymentStatus: {
      type: String,

      enum: [
        "pending",
        "paid",
        "failed",
      ],

      default: "pending",
    },

    /*
    |--------------------------------------------------------------------------
    | RAZORPAY ORDER ID
    |--------------------------------------------------------------------------
    |
    | Example:
    | order_Razorpay123456
    |
    | This is generated by Razorpay when an online
    | payment order is created.
    |
    */

    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RAZORPAY PAYMENT ID
    |--------------------------------------------------------------------------
    |
    | Example:
    | pay_Razorpay123456
    |
    | This is received after successful payment.
    |
    */

    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RAZORPAY SIGNATURE
    |--------------------------------------------------------------------------
    |
    | Used by the backend to verify that the
    | Razorpay payment response is genuine.
    |
    */

    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | ORDER STATUS
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
  mongoose.model<IOrder>(
    "Order",
    OrderSchema
  );

export default Order;