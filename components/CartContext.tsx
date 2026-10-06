"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

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
  | MongoDB Product _id
  |
  | IMPORTANT:
  | This must be a string, not number.
  */
  id: string;

  name: string;
  slug: string;
  price: number;

  /*
  | Old compatibility fields
  */
  oldPrice?: number;
  discount?: number;
  image?: string;

  /*
  | New MongoDB product images
  */
  images?: string[];

  /*
  | Category can be either the old string
  | or the new MongoDB category object.
  */
  category?: string | ProductCategory | null;

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
*/

const CART_STORAGE_KEY =
  "ecommerce-cart";

const CART_UPDATE_EVENT =
  "ecommerce-cart-updated";

/*
|--------------------------------------------------------------------------
| HELPER
|--------------------------------------------------------------------------
|
| MongoDB's default ObjectId is a 24-character
| hexadecimal string.
|
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
| CART PROVIDER
|--------------------------------------------------------------------------
*/

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [isLoaded, setIsLoaded] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD CART FROM LOCAL STORAGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(
          CART_STORAGE_KEY
        );

      if (!savedCart) {
        setCartItems([]);
        setIsLoaded(true);
        return;
      }

      const parsedCart =
        JSON.parse(savedCart);

      if (!Array.isArray(parsedCart)) {
        setCartItems([]);
        setIsLoaded(true);
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | CLEAN OLD CART DATA
      |--------------------------------------------------------------------------
      |
      | Previous products used numeric IDs.
      |
      | Example:
      |
      | Old:
      | id: 1
      |
      | New:
      | id: "68fxxxxxxxxxxxxxxxxxxxx"
      |
      | We remove old numeric products automatically.
      |
      */

      const validCart =
        parsedCart.filter(
          (item: CartItem) => {
            if (!item?.product) {
              return false;
            }

            return isValidMongoId(
              item.product.id
            );
          }
        );

      setCartItems(validCart);

      /*
      |--------------------------------------------------------------------------
      | If old/invalid cart items existed,
      | update localStorage immediately.
      |--------------------------------------------------------------------------
      */

      if (
        validCart.length !==
        parsedCart.length
      ) {
        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify(validCart)
        );
      }
    } catch (error) {
      console.error(
        "Cart loading error:",
        error
      );

      /*
      | If corrupted cart data exists,
      | reset it.
      */

      try {
        localStorage.removeItem(
          CART_STORAGE_KEY
        );
      } catch {
        // Ignore storage cleanup error
      }

      setCartItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SAVE CART TO LOCAL STORAGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Cart saving error:",
        error
      );
    }
  }, [cartItems, isLoaded]);

  /*
  |--------------------------------------------------------------------------
  | SYNC CART BETWEEN COMPONENTS / TABS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleCartUpdate = () => {
      try {
        const savedCart =
          localStorage.getItem(
            CART_STORAGE_KEY
          );

        if (!savedCart) {
          setCartItems([]);
          return;
        }

        const parsedCart =
          JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) {
          setCartItems([]);
          return;
        }

        const validCart =
          parsedCart.filter(
            (item: CartItem) =>
              item?.product &&
              isValidMongoId(
                item.product.id
              )
          );

        setCartItems(validCart);
      } catch (error) {
        console.error(
          "Cart sync error:",
          error
        );
      }
    };

    const handleStorage = (
      event: StorageEvent
    ) => {
      if (
        event.key ===
        CART_STORAGE_KEY
      ) {
        handleCartUpdate();
      }
    };

    window.addEventListener(
      CART_UPDATE_EVENT,
      handleCartUpdate
    );

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
  }, []);

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
    | Validate MongoDB ID
    |--------------------------------------------------------------------------
    */

    if (!isValidMongoId(product.id)) {
      console.error(
        "Invalid MongoDB product ID:",
        product.id
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate quantity
    |--------------------------------------------------------------------------
    */

    let selectedQuantity = Math.max(
      1,
      Number(quantity || 1)
    );

    /*
    |--------------------------------------------------------------------------
    | Respect stock
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
    | Normalize variant values
    |--------------------------------------------------------------------------
    */

    const selectedSize =
      size || "";

    const selectedColor =
      color || "";

    /*
    |--------------------------------------------------------------------------
    | Add / Replace existing item
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
        | Existing product
        |--------------------------------------------------------------------------
        */

        if (
          existingIndex !== -1
        ) {
          return currentItems.map(
            (item, index) => {
              if (
                index !==
                existingIndex
              ) {
                return item;
              }

              return {
                ...item,

                /*
                | Keep the newest MongoDB
                | product information.
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
        | New product
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
    | Remove if quantity is zero
    |--------------------------------------------------------------------------
    */

    if (quantity <= 0) {
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
                Number(quantity)
              );

            /*
            |--------------------------------------------------------------------------
            | Don't allow quantity above stock
            |--------------------------------------------------------------------------
            */

            if (
              typeof item.product
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
    | Remove localStorage immediately
    |--------------------------------------------------------------------------
    */

    try {
      localStorage.removeItem(
        CART_STORAGE_KEY
      );
    } catch (error) {
      console.error(
        "Clear cart storage error:",
        error
      );
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
      (total, item) =>
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
      (total, item) =>
        total +
        Number(
          item.product.price || 0
        ) *
          Number(
            item.quantity || 0
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
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}