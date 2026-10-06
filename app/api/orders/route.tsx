  import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";

type OrderItemRequest = {
  productId?: unknown;
  quantity?: unknown;
  size?: unknown;
  color?: unknown;
};

type ShippingAddressRequest = {
  address?: unknown;
  city?: unknown;
  state?: unknown;
  pincode?: unknown;
};

/*
|--------------------------------------------------------------------------
| POST /api/orders
|--------------------------------------------------------------------------
*/

export async function POST(request: Request) {
  let session: mongoose.ClientSession | null = null;

  try {
    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    const auth = await requireAuth();

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            auth.status === 401
              ? "Please login before placing an order."
              : auth.message,
        },
        {
          status: auth.status,
        }
      );
    }

    const user = auth.user;

    /*
    |--------------------------------------------------------------------------
    | Request body
    |--------------------------------------------------------------------------
    */

    let body: {
      items?: unknown;
      shippingAddress?: ShippingAddressRequest;
      deliveryMethod?: unknown;
      paymentMethod?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      items,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
    } = body;

    /*
    |--------------------------------------------------------------------------
    | Basic validation
    |--------------------------------------------------------------------------
    */

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Complete shipping address is required.",
        },
        {
          status: 400,
        }
      );
    }

    const address = String(
      shippingAddress.address || ""
    ).trim();

    const city = String(
      shippingAddress.city || ""
    ).trim();

    const state = String(
      shippingAddress.state || ""
    ).trim();

    const pincode = String(
      shippingAddress.pincode || ""
    ).trim();

    if (!address || !city || !state) {
      return NextResponse.json(
        {
          success: false,
          message: "Complete shipping address is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 6-digit PIN code.",
        },
        {
          status: 400,
        }
      );
    }

    const deliveryMethodValue = String(
      deliveryMethod || ""
    ).trim();

    if (!deliveryMethodValue) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery method is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !paymentMethod ||
      !["cod", "online"].includes(
        String(paymentMethod)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Online payment
    |--------------------------------------------------------------------------
    |
    | Online payment is not being processed by this endpoint yet.
    |
    */

    if (paymentMethod === "online") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Online payment is coming soon. Please select Cash on Delivery for now.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate cart items
    |--------------------------------------------------------------------------
    */

    const normalizedItems = items.map(
      (item: OrderItemRequest) => ({
        productId: String(
          item.productId || ""
        ).trim(),

        quantity: Number(
          item.quantity
        ),

        size: item.size
          ? String(item.size).trim()
          : undefined,

        color: item.color
          ? String(item.color).trim()
          : undefined,
      })
    );

    /*
    |--------------------------------------------------------------------------
    | Validate product IDs
    |--------------------------------------------------------------------------
    */

    if (
      normalizedItems.some(
        (item) =>
          !mongoose.Types.ObjectId.isValid(
            item.productId
          )
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more products in your cart are invalid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate quantities
    |--------------------------------------------------------------------------
    */

    if (
      normalizedItems.some(
        (item) =>
          !Number.isInteger(
            item.quantity
          ) ||
          item.quantity < 1
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product quantity.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Unique product IDs
    |--------------------------------------------------------------------------
    |
    | The same product can appear in the cart more than once,
    | for example with different sizes or colors.
    |
    */

    const uniqueProductIds = [
      ...new Set(
        normalizedItems.map(
          (item) => item.productId
        )
      ),
    ];

    /*
    |--------------------------------------------------------------------------
    | Connect database
    |--------------------------------------------------------------------------
    */

    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | Start MongoDB transaction
    |--------------------------------------------------------------------------
    |
    | The order creation and stock deduction happen together.
    | If anything fails, MongoDB rolls everything back.
    |
    */

    session = await mongoose.startSession();

    session.startTransaction();

    /*
    |--------------------------------------------------------------------------
    | Fetch products
    |--------------------------------------------------------------------------
    */

    const products = await Product.find({
      _id: {
        $in: uniqueProductIds,
      },
    })
      .session(session)
      .lean();

    if (
      products.length !==
      uniqueProductIds.length
    ) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message:
            "One or more products are no longer available.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Product map
    |--------------------------------------------------------------------------
    */

    const productMap = new Map(
      products.map(
        (product: any) => [
          product._id.toString(),
          product,
        ]
      )
    );

    /*
    |--------------------------------------------------------------------------
    | Calculate requested quantity
    |--------------------------------------------------------------------------
    */

    const requestedQuantityMap =
      new Map<string, number>();

    for (const item of normalizedItems) {
      const current =
        requestedQuantityMap.get(
          item.productId
        ) || 0;

      requestedQuantityMap.set(
        item.productId,
        current + item.quantity
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate products + stock
    |--------------------------------------------------------------------------
    */

    for (const [
      productId,
      requestedQuantity,
    ] of requestedQuantityMap) {
      const product =
        productMap.get(productId);

      if (!product) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              "A product in your cart could not be found.",
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Product status
      |--------------------------------------------------------------------------
      */

      if (product.status !== "active") {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              `${product.name} is currently unavailable.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Stock
      |--------------------------------------------------------------------------
      */

      if (product.stock <= 0) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              `${product.name} is out of stock.`,
          },
          {
            status: 400,
          }
        );
      }

      if (
        requestedQuantity >
        product.stock
      ) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              `Only ${product.stock} unit(s) of ${product.name} are available.`,
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Prepare order items
    |--------------------------------------------------------------------------
    */

    const orderItems: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
      size?: string;
      color?: string;
    }[] = [];

    let calculatedSubtotal = 0;

    for (const item of normalizedItems) {
      const product =
        productMap.get(
          item.productId
        );

      if (!product) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              "A product in your cart could not be found.",
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Size validation
      |--------------------------------------------------------------------------
      */

      if (
        item.size &&
        Array.isArray(product.sizes) &&
        product.sizes.length > 0 &&
        !product.sizes.includes(
          item.size
        )
      ) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              `Selected size is no longer available for ${product.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Color validation
      |--------------------------------------------------------------------------
      */

      if (
        item.color &&
        Array.isArray(product.colors) &&
        product.colors.length > 0 &&
        !product.colors.includes(
          item.color
        )
      ) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              `Selected color is no longer available for ${product.name}.`,
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SERVER PRICE
      |--------------------------------------------------------------------------
      */

      const price = Number(
        product.price
      );

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message: "Invalid product price.",
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Never trust the price coming from
      | the browser.
      |--------------------------------------------------------------------------
      */

      const itemTotal =
        price * item.quantity;

      calculatedSubtotal +=
        itemTotal;

      /*
      |--------------------------------------------------------------------------
      | Product image
      |--------------------------------------------------------------------------
      */

      const image =
        Array.isArray(product.images) &&
        product.images.length > 0
          ? product.images[0]
          : "";

      /*
      |--------------------------------------------------------------------------
      | Order item
      |--------------------------------------------------------------------------
      */

      orderItems.push({
        productId:
          product._id.toString(),

        name: product.name,

        price,

        quantity:
          item.quantity,

        image,

        size: item.size,

        color: item.color,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Shipping
    |--------------------------------------------------------------------------
    |
    | Your current store uses free shipping.
    |
    */

    const calculatedShipping = 0;

    const calculatedTotal =
      calculatedSubtotal +
      calculatedShipping;

    /*
    |--------------------------------------------------------------------------
    | ATOMIC STOCK DECREMENT
    |--------------------------------------------------------------------------
    |
    | We update each product only if enough stock
    | still exists.
    |
    */

    for (const [
      productId,
      requestedQuantity,
    ] of requestedQuantityMap) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: productId,
            status: "active",
            stock: {
              $gte:
                requestedQuantity,
            },
          },
          {
            $inc: {
              stock:
                -requestedQuantity,
            },
          },
          {
            new: true,
            session,
          }
        );

      if (!updatedProduct) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              "Stock changed while placing your order. Please review your cart and try again.",
          },
          {
            status: 409,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE ORDER
    |--------------------------------------------------------------------------
    */

    const createdOrders =
      await Order.create(
        [
          {
            userId: user.id,

            items: orderItems,

            customer: {
              name: user.name,

              email:
                user.email,

              phone:
                user.phone || "",
            },

            shippingAddress: {
              address,

              city,

              state,

              pincode,
            },

            deliveryMethod:
              deliveryMethodValue,

            paymentMethod,

            paymentStatus:
              "pending",

            orderStatus:
              "pending",

            subtotal:
              calculatedSubtotal,

            shipping:
              calculatedShipping,

            total:
              calculatedTotal,
          },
        ],
        {
          session,
        }
      );

    const order =
      createdOrders[0];

    if (!order) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to create order.",
        },
        {
          status: 500,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | COMMIT TRANSACTION
    |--------------------------------------------------------------------------
    */

    await session.commitTransaction();

    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,

        message:
          "Order created successfully.",

        order: {
          id:
            order._id.toString(),

          total:
            order.total,

          paymentMethod:
            order.paymentMethod,

          paymentStatus:
            order.paymentStatus,

          orderStatus:
            order.orderStatus,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    /*
    |--------------------------------------------------------------------------
    | ROLLBACK
    |--------------------------------------------------------------------------
    */

    if (session) {
      try {
        await session.abortTransaction();
      } catch (rollbackError) {
        console.error(
          "Order transaction rollback error:",
          rollbackError
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | GENERAL ERROR
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create order.",
      },
      {
        status: 500,
      }
    );
  } finally {
    /*
    |--------------------------------------------------------------------------
    | END SESSION
    |--------------------------------------------------------------------------
    */

    if (session) {
      await session.endSession();
    }
  }
}