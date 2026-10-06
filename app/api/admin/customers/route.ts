import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";

import User from "@/models/User";
import Order from "@/models/Order";


// ============================================================
// Escape user input before using it inside MongoDB regex
// ============================================================

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


// ============================================================
// GET /api/admin/customers
// ============================================================

export async function GET(request: Request) {
  try {
    // ----------------------------------------------------------
    // Admin authentication
    // ----------------------------------------------------------

    const auth = await requireAdmin();

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message: auth.message,
        },
        {
          status: auth.status,
        }
      );
    }


    // ----------------------------------------------------------
    // URL parameters
    // ----------------------------------------------------------

    const { searchParams } = new URL(request.url);

    const rawPage = searchParams.get("page");
    const rawLimit = searchParams.get("limit");
    const rawSearch = searchParams.get("search");


    // ----------------------------------------------------------
    // Pagination validation
    // ----------------------------------------------------------

    const page = Math.max(
      Number.parseInt(rawPage || "1", 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(rawLimit || "20", 10) || 20,
        1
      ),
      100
    );

    const skip = (page - 1) * limit;


    // ----------------------------------------------------------
    // Search
    // ----------------------------------------------------------

    const search =
      typeof rawSearch === "string"
        ? rawSearch.trim()
        : "";

    let searchFilter = {};

    if (search) {
      /*
       * IMPORTANT:
       * Escape special regex characters so that customer
       * search behaves like normal text search.
       *
       * Example:
       * ".*" will now search for the literal text ".*"
       * instead of matching every customer.
       */

      const safeSearch = escapeRegex(search);

      searchFilter = {
        $or: [
          {
            name: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            email: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            phone: {
              $regex: safeSearch,
              $options: "i",
            },
          },
        ],
      };
    }


    // ----------------------------------------------------------
    // Database
    // ----------------------------------------------------------

    await connectDB();


    // ----------------------------------------------------------
    // Customer filter
    // ----------------------------------------------------------

    const customerFilter = {
      role: "customer",
      ...searchFilter,
    };


    // ----------------------------------------------------------
    // Get total customer count
    // ----------------------------------------------------------

    const total = await User.countDocuments(
      customerFilter
    );


    // ----------------------------------------------------------
    // Get customers
    // ----------------------------------------------------------

    const customers = await User.find(
      customerFilter
    )
      .select(
        "_id name email phone address city state pincode role accountStatus createdAt updatedAt"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean();


    // ----------------------------------------------------------
    // Get order statistics for current customers
    // ----------------------------------------------------------

    const customerIds = customers.map(
      (customer) => customer._id
    );


    let orderStats: Array<{
      _id: string;
      orderCount: number;
      totalSpent: number;
      latestOrderDate: Date | null;
    }> = [];


    if (customerIds.length > 0) {
      orderStats = await Order.aggregate([
        {
          $match: {
            userId: {
              $in: customerIds,
            },
          },
        },

        {
          $group: {
            _id: "$userId",

            orderCount: {
              $sum: 1,
            },

            totalSpent: {
              $sum: {
                $cond: [
                  {
                    $ne: [
                      "$orderStatus",
                      "cancelled",
                    ],
                  },
                  "$total",
                  0,
                ],
              },
            },

            latestOrderDate: {
              $max: "$createdAt",
            },
          },
        },
      ]);
    }


    // ----------------------------------------------------------
    // Create quick lookup for order statistics
    // ----------------------------------------------------------

    const orderStatsMap = new Map<
      string,
      {
        orderCount: number;
        totalSpent: number;
        latestOrderDate: Date | null;
      }
    >();


    for (const stats of orderStats) {
      orderStatsMap.set(
        stats._id.toString(),
        {
          orderCount: stats.orderCount || 0,
          totalSpent: stats.totalSpent || 0,
          latestOrderDate:
            stats.latestOrderDate || null,
        }
      );
    }


    // ----------------------------------------------------------
    // Format customers
    // ----------------------------------------------------------

    const formattedCustomers = customers.map(
      (customer) => {
        const customerId =
          customer._id.toString();

        const stats =
          orderStatsMap.get(customerId);

        return {
          id: customerId,

          name: customer.name,

          email: customer.email,

          phone: customer.phone,

          address: customer.address || "",

          city: customer.city || "",

          state: customer.state || "",

          pincode: customer.pincode || "",

          role: customer.role,

          /*
           * Older users may not have accountStatus
           * because the field was added later.
           *
           * Treat missing status as active.
           */

          accountStatus:
            customer.accountStatus ||
            "active",

          createdAt:
            customer.createdAt.toISOString(),

          updatedAt:
            customer.updatedAt.toISOString(),

          orderCount:
            stats?.orderCount || 0,

          totalSpent:
            stats?.totalSpent || 0,

          latestOrderDate:
            stats?.latestOrderDate
              ? stats.latestOrderDate.toISOString()
              : null,
        };
      }
    );


    // ----------------------------------------------------------
    // Pagination
    // ----------------------------------------------------------

    const totalPages =
      Math.ceil(total / limit);

    const hasNextPage =
      page < totalPages;

    const hasPreviousPage =
      page > 1;


    // ----------------------------------------------------------
    // Response
    // ----------------------------------------------------------

    return NextResponse.json({
      success: true,

      customers: formattedCustomers,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error(
      "Admin customers API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load customers.",
      },
      {
        status: 500,
      }
    );
  }
}