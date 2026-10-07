"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

import { usePathname } from "next/navigation";

/*
|--------------------------------------------------------------------------
| PRODUCT
|--------------------------------------------------------------------------
*/

interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface Product {
  /*
  |--------------------------------------------------------------------------
  | MongoDB Product _id
  |--------------------------------------------------------------------------
  */

  id: string;

  name: string;

  slug: string;

  price: number;

  /*
  |--------------------------------------------------------------------------
  | Old compatibility fields
  |--------------------------------------------------------------------------
  */

  oldPrice?: number;

  discount?: number;

  image?: string;

  /*
  |--------------------------------------------------------------------------
  | New MongoDB product images
  |--------------------------------------------------------------------------
  */

  images?: string[];

  /*
  |--------------------------------------------------------------------------
  | Category
  |--------------------------------------------------------------------------
  */

  category?:
    | string
    | ProductCategory
    | null;

  description?: string;

  sizes?: string[];

  colors?: string[];

  sku?: string;

  stock?: number;

  lowStockThreshold?: number;

  status?:
    | "active"
    | "draft"
    | "out_of_stock";

  featured?: boolean;

  newArrival?: boolean;
}

/*
|--------------------------------------------------------------------------
| CART ITEM
|--------------------------------------------------------------------------
*/

export interface CartItem {
  product: Product;

  quantity: number;

  size?: string;

  color?: string;
}

/*
|--------------------------------------------------------------------------
| CART CONTEXT
|--------------------------------------------------------------------------
*/

interface CartContextType {
  cartItems: CartItem[];

  addToCart: (
    product: Product,
    quantity?: number,
    size?: string,
    color?: string
  ) => void;

  removeFromCart: (
    productId: string,
    size?: string,
    color?: string
  ) => void;

  updateQuantity: (
    productId: string,
    quantity: number,
    size?: string,
    color?: string
  ) => void;

  clearCart: () => void;

  cartCount: number;

  cartTotal: number;
}

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

/*
|--------------------------------------------------------------------------
| STORAGE
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| We DO NOT use one common cart anymore.
|
| Instead:
|
| ecommerce-cart-USER_ID
|
| Example:
|
| ecommerce-cart-68f123456789012345678901
|
|--------------------------------------------------------------------------
*/

const CART_STORAGE_PREFIX =
  "ecommerce-cart-";

const LEGACY_CART_STORAGE_KEY =
  "ecommerce-cart";

const CART_UPDATE_EVENT =
  "ecommerce-cart-updated";

/*
|--------------------------------------------------------------------------
| AUTH UPDATE EVENT
|--------------------------------------------------------------------------
|
| This allows the cart to refresh when login/logout
| happens in another component.
|
|--------------------------------------------------------------------------
*/

const AUTH_UPDATE_EVENT =
  "auth-updated";

/*
|--------------------------------------------------------------------------
| HELPER
|--------------------------------------------------------------------------
|
| MongoDB's default ObjectId is a 24-character
| hexadecimal string.
|
|--------------------------------------------------------------------------
*/

function isValidMongoId(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    /^[a-f\d]{24}$/i.test(value)
  );
}

/*
|--------------------------------------------------------------------------
| GET PRODUCT IMAGE
|--------------------------------------------------------------------------
*/

export function getProductImage(
  product: Product
) {
  return (
    product.images?.[0] ||
    product.image ||
    ""
  );
}

/*
|--------------------------------------------------------------------------
| GET USER ID
|--------------------------------------------------------------------------
*/

async function getCurrentUserId(): Promise<
  string | null
> {
  try {
    const response = await fetch(
      "/api/auth/me",
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    /*
     * Your auth API returns the user object.
     *
     * We support both:
     *
     * data.user.id
     *
     * and
     *
     * data.user._id
     */

    const userId =
      data?.user?.id ||
      data?.user?._id ||
      null;

    if (!userId) {
      return null;
    }

    return String(userId);
  } catch (error) {
    console.error(
      "Cart auth check error:",
      error
    );

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| GET USER-SPECIFIC STORAGE KEY
|--------------------------------------------------------------------------
*/

function getCartStorageKey(
  userId: string
) {
  return `${CART_STORAGE_PREFIX}${userId}`;
}

/*
|--------------------------------------------------------------------------
| CLEAN CART
|--------------------------------------------------------------------------
*/

function validateCart(
  cart: unknown
): CartItem[] {
  if (!Array.isArray(cart)) {
    return [];
  }

  return cart.filter(
    (item: CartItem) => {
      if (!item?.product) {
        return false;
      }

      return isValidMongoId(
        item.product.id
      );
    }
  );
}

/*
|--------------------------------------------------------------------------
| CART PROVIDER
|--------------------------------------------------------------------------
*/

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  /*
  |--------------------------------------------------------------------------
  | CART STATE
  |--------------------------------------------------------------------------
  */

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  /*
  |--------------------------------------------------------------------------
  | CURRENT USER
  |--------------------------------------------------------------------------
  */

  const [userId, setUserId] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | AUTH RESOLVED
  |--------------------------------------------------------------------------
  |
  | This is important.
  |
  | We must NOT save an empty cart before we know
  | which user is logged in.
  |
  |--------------------------------------------------------------------------
  */

  const [authResolved, setAuthResolved] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | CART LOADED
  |--------------------------------------------------------------------------
  */

  const [isLoaded, setIsLoaded] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD CURRENT USER
  |--------------------------------------------------------------------------
  |
  | We check /api/auth/me whenever the route changes.
  |
  | This catches:
  |
  | Login
  | Logout
  | Switching accounts
  |
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const currentUserId =
          await getCurrentUserId();

        if (!mounted) {
          return;
        }

        setUserId(currentUserId);
      } catch (error) {
        console.error(
          "Current user loading error:",
          error
        );

        if (mounted) {
          setUserId(null);
        }
      } finally {
        if (mounted) {
          setAuthResolved(true);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  /*
  |--------------------------------------------------------------------------
  | ALSO CHECK AUTH WHEN WINDOW GETS FOCUS
  |--------------------------------------------------------------------------
  |
  | This helps when the user logs in/out and returns
  | to the existing page.
  |
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleFocus = async () => {
      const currentUserId =
        await getCurrentUserId();

      setUserId(
        currentUserId
      );

      setAuthResolved(true);
    };

    const handleVisibilityChange =
      async () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          await handleFocus();
        }
      };

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | AUTH EVENT
  |--------------------------------------------------------------------------
  |
  | If login/logout dispatches "auth-updated",
  | immediately reload the current user.
  |
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleAuthUpdate =
      async () => {
        const currentUserId =
          await getCurrentUserId();

        setUserId(
          currentUserId
        );

        setAuthResolved(true);
      };

    window.addEventListener(
      AUTH_UPDATE_EVENT,
      handleAuthUpdate
    );

    return () => {
      window.removeEventListener(
        AUTH_UPDATE_EVENT,
        handleAuthUpdate
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD USER-SPECIFIC CART
  |--------------------------------------------------------------------------
  |
  | Whenever userId changes:
  |
  | User A
  |   ↓
  | ecommerce-cart-A
  |
  | User B
  |   ↓
  | ecommerce-cart-B
  |
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!authResolved) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | NO USER LOGGED IN
    |--------------------------------------------------------------------------
    |
    | Never show another user's cart.
    |
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      setCartItems([]);
      setIsLoaded(true);
      return;
    }

    try {
      const storageKey =
        getCartStorageKey(
          userId
        );

      const savedCart =
        localStorage.getItem(
          storageKey
        );

      /*
      |--------------------------------------------------------------------------
      | NO CART FOR THIS USER
      |--------------------------------------------------------------------------
      */

      if (!savedCart) {
        setCartItems([]);
        setIsLoaded(true);
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | PARSE CART
      |--------------------------------------------------------------------------
      */

      const parsedCart =
        JSON.parse(savedCart);

      /*
      |--------------------------------------------------------------------------
      | INVALID CART
      |--------------------------------------------------------------------------
      */

      if (!Array.isArray(parsedCart)) {
        localStorage.removeItem(
          storageKey
        );

        setCartItems([]);
        setIsLoaded(true);
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATE CART ITEMS
      |--------------------------------------------------------------------------
      */

      const validCart =
        validateCart(
          parsedCart
        );

      /*
      |--------------------------------------------------------------------------
      | SET CART
      |--------------------------------------------------------------------------
      */

      setCartItems(
        validCart
      );

      /*
      |--------------------------------------------------------------------------
      | CLEAN INVALID DATA
      |--------------------------------------------------------------------------
      */

      if (
        validCart.length !==
        parsedCart.length
      ) {
        localStorage.setItem(
          storageKey,
          JSON.stringify(
            validCart
          )
        );
      }
    } catch (error) {
      console.error(
        "User cart loading error:",
        error
      );

      try {
        const storageKey =
          getCartStorageKey(
            userId
          );

        localStorage.removeItem(
          storageKey
        );
      } catch {
        // Ignore storage cleanup errors
      }

      setCartItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, [
    userId,
    authResolved,
  ]);

  /*
  |--------------------------------------------------------------------------
  | REMOVE OLD GLOBAL CART
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | Your previous implementation used:
  |
  | ecommerce-cart
  |
  | That cart doesn't belong to a specific user.
  |
  | We remove it once so it cannot leak into
  | another account.
  |
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!authResolved) {
      return;
    }

    try {
      localStorage.removeItem(
        LEGACY_CART_STORAGE_KEY
      );
    } catch {
      // Ignore cleanup error
    }
  }, [authResolved]);

  /*
  |--------------------------------------------------------------------------
  | SAVE CART TO USER-SPECIFIC LOCAL STORAGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    /*
    |--------------------------------------------------------------------------
    | DO NOT SAVE UNTIL AUTH IS KNOWN
    |--------------------------------------------------------------------------
    */

    if (!authResolved) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | DO NOT SAVE CART FOR LOGGED-OUT USER
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | DO NOT SAVE BEFORE CART IS LOADED
    |--------------------------------------------------------------------------
    */

    if (!isLoaded) {
      return;
    }

    try {
      const storageKey =
        getCartStorageKey(
          userId
        );

      localStorage.setItem(
        storageKey,
        JSON.stringify(
          cartItems
        )
      );
    } catch (error) {
      console.error(
        "Cart saving error:",
        error
      );
    }
  }, [
    cartItems,
    userId,
    authResolved,
    isLoaded,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SYNC CART BETWEEN COMPONENTS / TABS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!userId) {
      return;
    }

    const storageKey =
      getCartStorageKey(
        userId
      );

    /*
    |--------------------------------------------------------------------------
    | HANDLE CART UPDATE
    |--------------------------------------------------------------------------
    */

    const handleCartUpdate =
      () => {
        try {
          const savedCart =
            localStorage.getItem(
              storageKey
            );

          if (!savedCart) {
            setCartItems([]);
            return;
          }

          const parsedCart =
            JSON.parse(
              savedCart
            );

          const validCart =
            validateCart(
              parsedCart
            );

          setCartItems(
            validCart
          );
        } catch (error) {
          console.error(
            "Cart sync error:",
            error
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | HANDLE STORAGE EVENT
    |--------------------------------------------------------------------------
    */

    const handleStorage = (
      event: StorageEvent
    ) => {
      /*
      |--------------------------------------------------------------------------
      | IMPORTANT:
      |
      | Only respond to THIS user's cart key.
      |--------------------------------------------------------------------------
      */

      if (
        event.key ===
        storageKey
      ) {
        handleCartUpdate();
      }
    };

    /*
    |--------------------------------------------------------------------------
    | CUSTOM CART EVENT
    |--------------------------------------------------------------------------
    */

    window.addEventListener(
      CART_UPDATE_EVENT,
      handleCartUpdate
    );

    /*
    |--------------------------------------------------------------------------
    | BROWSER STORAGE EVENT
    |--------------------------------------------------------------------------
    */

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        CART_UPDATE_EVENT,
        handleCartUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [userId]);

  /*
  |--------------------------------------------------------------------------
  | NOTIFY CART UPDATE
  |--------------------------------------------------------------------------
  */

  const notifyCartUpdate = () => {
    if (
      typeof window !==
      "undefined"
    ) {
      window.dispatchEvent(
        new Event(
          CART_UPDATE_EVENT
        )
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  |--------------------------------------------------------------------------
  */

  const addToCart = (
    product: Product,
    quantity = 1,
    size = "",
    color = ""
  ) => {
    /*
    |--------------------------------------------------------------------------
    | USER MUST BE LOGGED IN
    |--------------------------------------------------------------------------
    */

    if (!userId) {
      console.error(
        "Cannot add to cart without a logged-in user."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE MONGODB ID
    |--------------------------------------------------------------------------
    */

    if (
      !isValidMongoId(
        product.id
      )
    ) {
      console.error(
        "Invalid MongoDB product ID:",
        product.id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE QUANTITY
    |--------------------------------------------------------------------------
    */

    let selectedQuantity =
      Math.max(
        1,
        Number(
          quantity || 1
        )
      );

    /*
    |--------------------------------------------------------------------------
    | RESPECT STOCK
    |--------------------------------------------------------------------------
    */

    if (
      typeof product.stock ===
        "number" &&
      product.stock > 0
    ) {
      selectedQuantity =
        Math.min(
          selectedQuantity,
          product.stock
        );
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE VARIANTS
    |--------------------------------------------------------------------------
    */

    const selectedSize =
      size || "";

    const selectedColor =
      color || "";

    /*
    |--------------------------------------------------------------------------
    | ADD / REPLACE EXISTING ITEM
    |--------------------------------------------------------------------------
    */

    setCartItems(
      (currentItems) => {
        const existingIndex =
          currentItems.findIndex(
            (item) =>
              item.product.id ===
                product.id &&
              (item.size || "") ===
                selectedSize &&
              (item.color || "") ===
                selectedColor
          );

        /*
        |--------------------------------------------------------------------------
        | EXISTING PRODUCT
        |--------------------------------------------------------------------------
        */

        if (
          existingIndex !==
          -1
        ) {
          return currentItems.map(
            (
              item,
              index
            ) => {
              if (
                index !==
                existingIndex
              ) {
                return item;
              }

              return {
                ...item,

                /*
                |--------------------------------------------------------------------------
                | Keep newest product information
                |--------------------------------------------------------------------------
                */

                product,

                quantity:
                  selectedQuantity,

                size:
                  selectedSize,

                color:
                  selectedColor,
              };
            }
          );
        }

        /*
        |--------------------------------------------------------------------------
        | NEW PRODUCT
        |--------------------------------------------------------------------------
        */

        return [
          ...currentItems,

          {
            product,

            quantity:
              selectedQuantity,

            size:
              selectedSize,

            color:
              selectedColor,
          },
        ];
      }
    );

    setTimeout(() => {
      notifyCartUpdate();
    }, 0);
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE FROM CART
  |--------------------------------------------------------------------------
  */

  const removeFromCart = (
    productId: string,
    size = "",
    color = ""
  ) => {
    if (!productId) {
      return;
    }

    setCartItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            !(
              item.product.id ===
                productId &&
              (item.size || "") ===
                size &&
              (item.color || "") ===
                color
            )
        )
    );

    setTimeout(() => {
      notifyCartUpdate();
    }, 0);
  };

  /*
  |--------------------------------------------------------------------------
  | UPDATE QUANTITY
  |--------------------------------------------------------------------------
  */

  const updateQuantity = (
    productId: string,
    quantity: number,
    size = "",
    color = ""
  ) => {
    if (!productId) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE IF QUANTITY IS ZERO
    |--------------------------------------------------------------------------
    */

    if (
      quantity <= 0
    ) {
      removeFromCart(
        productId,
        size,
        color
      );

      return;
    }

    setCartItems(
      (currentItems) =>
        currentItems.map(
          (item) => {
            if (
              item.product.id !==
                productId ||
              (item.size || "") !==
                size ||
              (item.color || "") !==
                color
            ) {
              return item;
            }

            let newQuantity =
              Math.max(
                1,
                Number(
                  quantity
                )
              );

            /*
            |--------------------------------------------------------------------------
            | DON'T ALLOW QUANTITY ABOVE STOCK
            |--------------------------------------------------------------------------
            */

            if (
              typeof item
                .product
                .stock ===
                "number" &&
              item.product.stock >
                0
            ) {
              newQuantity =
                Math.min(
                  newQuantity,
                  item.product
                    .stock
                );
            }

            return {
              ...item,

              quantity:
                newQuantity,
            };
          }
        )
    );

    setTimeout(() => {
      notifyCartUpdate();
    }, 0);
  };

  /*
  |--------------------------------------------------------------------------
  | CLEAR CART
  |--------------------------------------------------------------------------
  */

  const clearCart = () => {
    setCartItems([]);

    /*
    |--------------------------------------------------------------------------
    | REMOVE ONLY CURRENT USER'S CART
    |--------------------------------------------------------------------------
    */

    if (userId) {
      try {
        const storageKey =
          getCartStorageKey(
            userId
          );

        localStorage.removeItem(
          storageKey
        );
      } catch (error) {
        console.error(
          "Clear cart storage error:",
          error
        );
      }
    }

    setTimeout(() => {
      notifyCartUpdate();
    }, 0);
  };

  /*
  |--------------------------------------------------------------------------
  | CART COUNT
  |--------------------------------------------------------------------------
  */

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.quantity || 0
        ),
      0
    );
  }, [cartItems]);

  /*
  |--------------------------------------------------------------------------
  | CART TOTAL
  |--------------------------------------------------------------------------
  */

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.product.price ||
            0
        ) *
          Number(
            item.quantity ||
              0
          ),
      0
    );
  }, [cartItems]);

  /*
  |--------------------------------------------------------------------------
  | CONTEXT VALUE
  |--------------------------------------------------------------------------
  */

  const value =
    useMemo<CartContextType>(
      () => ({
        cartItems,

        addToCart,

        removeFromCart,

        updateQuantity,

        clearCart,

        cartCount,

        cartTotal,
      }),
      [
        cartItems,
        cartCount,
        cartTotal,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | PROVIDER
  |--------------------------------------------------------------------------
  */

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| USE CART
|--------------------------------------------------------------------------
*/

export function useCart() {
  const context =
    useContext(
      CartContext
    );

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}