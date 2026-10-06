"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

import { useCart } from "@/components/CartContext";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

type PaymentMethod = "cod" | "online";

/*
 * Razorpay Checkout type.
 * Razorpay adds this constructor to window after its checkout script loads.
 */
declare global {
  interface Window {
    Razorpay: new (options: Record<string, any>) => {
      open: () => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();

  const {
    cartItems,
    cartTotal,
    clearCart,
  } = useCart();

  const [user, setUser] = useState<User | null>(null);

  const [authLoading, setAuthLoading] = useState(true);

  const [editingContact, setEditingContact] =
    useState(false);

  const [editingAddress, setEditingAddress] =
    useState(false);

  const [savingContact, setSavingContact] =
    useState(false);

  const [savingAddress, setSavingAddress] =
    useState(false);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [razorpayReady, setRazorpayReady] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cod");

  const [phone, setPhone] = useState("");

  const [addressData, setAddressData] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* =========================
     LOAD USER
  ========================= */

  useEffect(() => {
    checkUser();
  }, []);

  /* =========================
     LOAD RAZORPAY CHECKOUT
  ========================= */

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      if ((window as any).Razorpay) {
        setRazorpayReady(true);
      }

      existingScript.addEventListener("load", () => {
        setRazorpayReady(true);
      });

      return;
    }

    const script = document.createElement("script");

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      setRazorpayReady(true);
    };

    script.onerror = () => {
      setRazorpayReady(false);
    };

    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  const checkUser = async () => {
    try {
      setAuthLoading(true);

      const response = await fetch(
        "/api/auth/me",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.authenticated) {
        router.push("/login?redirect=/checkout");
        return;
      }

      setUser(data.user);

      setPhone(data.user.phone || "");

      setAddressData({
        address: data.user.address || "",
        city: data.user.city || "",
        state: data.user.state || "",
        pincode: data.user.pincode || "",
      });

      /*
       * If address doesn't exist,
       * automatically open address edit mode.
       */

      if (
        !data.user.address ||
        !data.user.city ||
        !data.user.state ||
        !data.user.pincode
      ) {
        setEditingAddress(true);
      }
    } catch (error) {
      console.error(
        "Auth check error:",
        error
      );

      router.push("/login?redirect=/checkout");
    } finally {
      setAuthLoading(false);
    }
  };

  /* =========================
     ADDRESS CHANGE
  ========================= */

  const handleAddressChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setAddressData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================
     SAVE CONTACT
  ========================= */

  const saveContact = async () => {
    try {
      setError("");
      setSuccess("");

      if (!phone.trim()) {
        setError("Phone number is required.");
        return;
      }

      if (
        !/^\+?[0-9\s-]{10,15}$/.test(
          phone.trim()
        )
      ) {
        setError(
          "Please enter a valid phone number."
        );

        return;
      }

      setSavingContact(true);

      const response = await fetch(
        "/api/auth/me",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            phone: phone.trim(),

            address: user?.address || "",
            city: user?.city || "",
            state: user?.state || "",
            pincode: user?.pincode || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update phone number."
        );
      }

      setUser(data.user);

      setPhone(data.user.phone || "");

      setEditingContact(false);

      setSuccess(
        "Phone number updated successfully."
      );
    } catch (error) {
      console.error(
        "Contact update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update phone number."
      );
    } finally {
      setSavingContact(false);
    }
  };

  /* =========================
     SAVE ADDRESS
  ========================= */

  const saveAddress = async () => {
    try {
      setError("");
      setSuccess("");

      if (!addressData.address.trim()) {
        setError("Address is required.");
        return false;
      }

      if (!addressData.city.trim()) {
        setError("City is required.");
        return false;
      }

      if (!addressData.state.trim()) {
        setError("State is required.");
        return false;
      }

      if (
        !/^\d{6}$/.test(
          addressData.pincode.trim()
        )
      ) {
        setError(
          "Please enter a valid 6-digit PIN code."
        );

        return false;
      }

      setSavingAddress(true);

      const response = await fetch(
        "/api/auth/me",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            phone: user?.phone || phone,

            address:
              addressData.address.trim(),

            city:
              addressData.city.trim(),

            state:
              addressData.state.trim(),

            pincode:
              addressData.pincode.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save address."
        );
      }

      setUser(data.user);

      setPhone(data.user.phone || "");

      setAddressData({
        address: data.user.address || "",
        city: data.user.city || "",
        state: data.user.state || "",
        pincode: data.user.pincode || "",
      });

      setEditingAddress(false);

      setSuccess(
        "Delivery address saved successfully."
      );

      return true;
    } catch (error) {
      console.error(
        "Address update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save address."
      );

      return false;
    } finally {
      setSavingAddress(false);
    }
  };

  /* =========================
     SHIPPING
  ========================= */

  const shipping =
    cartTotal >= 2000 ? 0 : 99;

  const total = cartTotal + shipping;

  /* =========================
     PAYMENT CHANGE
  ========================= */

  const handlePaymentChange = (
    method: PaymentMethod
  ) => {
    setPaymentMethod(method);
    setError("");
    setSuccess("");
  };

  /* =========================
     PLACE ORDER
  ========================= */

  const handlePlaceOrder = async () => {
    try {
      setError("");
      setSuccess("");

      if (!user) {
        router.push("/login?redirect=/checkout");
        return;
      }

      if (cartItems.length === 0) {
        setError("Your cart is empty.");
        return;
      }

      /*
       * Save address if currently editing.
       */

      if (editingAddress) {
        const saved = await saveAddress();

        if (!saved) {
          return;
        }
      }

      /*
       * Online payment is handled after the order API
       * creates a Razorpay order.
       */

      if (paymentMethod === "online" && !razorpayReady) {
        setError(
          "Online payment is still loading. Please try again in a moment."
        );

        return;
      }

      /*
       * Make sure saved address exists.
       */

      if (
        !user.address ||
        !user.city ||
        !user.state ||
        !user.pincode
      ) {
        setError(
          "Please add your delivery address first."
        );

        setEditingAddress(true);

        return;
      }

      setPlacingOrder(true);

      const orderItems = cartItems.map(
        (item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
          size: item.size,
          color: item.color,
        })
      );

      const response = await fetch(
        "/api/orders",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            items: orderItems,

            shippingAddress: {
              address: user.address,
              city: user.city,
              state: user.state,
              pincode: user.pincode,
            },

            deliveryMethod:
              "Standard Delivery",

            paymentMethod,

            subtotal: cartTotal,

            shipping,

            total,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to place order."
        );
      }

      /*
       * COD is complete as soon as the order is created.
       */
      if (paymentMethod === "cod") {
        clearCart();

        router.push(
          `/order-success?orderId=${data.order.id}`
        );

        return;
      }

      /*
       * ONLINE PAYMENT
       *
       * The order API has now created both the local order
       * and the Razorpay order. Open Razorpay Checkout.
       */

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout could not be loaded. Please refresh and try again."
        );
      }

      const razorpayOptions = {
        key: data.order.razorpayKeyId,

        amount: data.order.razorpayAmount,

        currency: data.order.razorpayCurrency || "INR",

        name: "Your Store",

        description: `Order #${data.order.id}`,

        order_id: data.order.razorpayOrderId,

        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || "",
        },

        notes: {
          localOrderId: data.order.id,
        },

        theme: {
          color: "#111111",
        },

        handler: async (response: any) => {
          try {
            setError("");
            setSuccess(
              "Payment received. Verifying your payment..."
            );

            const verifyResponse = await fetch(
              "/api/payments/razorpay/verify",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                credentials: "include",

                body: JSON.stringify({
                  orderId: data.order.id,

                  razorpayOrderId:
                    response.razorpay_order_id,

                  razorpayPaymentId:
                    response.razorpay_payment_id,

                  razorpaySignature:
                    response.razorpay_signature,
                }),
              }
            );

            const verifyData =
              await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message ||
                  "Payment verification failed."
              );
            }

            clearCart();

            router.push(
              `/order-success?orderId=${data.order.id}`
            );
          } catch (verificationError) {
            console.error(
              "Payment verification error:",
              verificationError
            );

            setSuccess("");

            setError(
              verificationError instanceof Error
                ? verificationError.message
                : "Payment verification failed. Please contact support."
            );

            setPlacingOrder(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
            setSuccess("");
            setError(
              "Payment window was closed. Your order has not been marked as paid."
            );
          },
        },
      };

      const razorpay =
        new window.Razorpay(
          razorpayOptions
        );

      razorpay.open();
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to place your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /* =========================
     AUTH LOADING
  ========================= */

  if (authLoading) {
    return (
      <main
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <Icon
            icon="solar:refresh-circle-bold"
            width="42"
            height="42"
            style={{
              animation:
                "spin 1s linear infinite",
            }}
          />

          <p
            style={{
              marginTop: "12px",
              color: "#777",
              fontSize: "14px",
            }}
          >
            Loading your account...
          </p>
        </div>

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  /* =========================
     EMPTY CART
  ========================= */

  if (cartItems.length === 0) {
    return (
      <main
        style={{
          minHeight: "70vh",
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "50px 20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            background: "#fff",
            border: "1px solid #e5e5e5",
            padding: "55px 30px",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <Icon
            icon="solar:bag-4-bold"
            width="55"
            height="55"
          />

          <h2
            style={{
              margin: "20px 0 10px",
              fontSize: "25px",
            }}
          >
            Your Cart is Empty
          </h2>

          <p
            style={{
              color: "#777",
              marginBottom: "25px",
            }}
          >
            Add some products before
            proceeding to checkout.
          </p>

          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#111",
              color: "#fff",
              padding: "13px 24px",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Continue Shopping

            <Icon
              icon="solar:arrow-right-linear"
              width="18"
            />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "70vh",
        background: "#f7f7f5",
        padding: "65px 20px 100px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* =========================
            HEADER
        ========================= */}

        <div
          style={{
            marginBottom: "45px",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: "12px",
              letterSpacing: "2px",
              color: "#777",
            }}
          >
            CHECKOUT
          </p>

          <h1
            style={{
              margin: 0,
              fontSize:
                "clamp(36px, 5vw, 50px)",
              fontWeight: 600,
              letterSpacing: "-2px",
            }}
          >
            Complete Your Order
          </h1>
        </div>

        <div
          className="checkout-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.55fr) minmax(300px, 0.85fr)",
            gap: "30px",
            alignItems: "start",
          }}
        >
          {/* =========================
              LEFT
          ========================= */}

          <div
            style={{
              display: "grid",
              gap: "25px",
            }}
          >
            {/* =========================
                CONTACT INFORMATION
            ========================= */}

            <section
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "30px",
                border:
                  "1px solid #ededed",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: "15px",
                  marginBottom: "25px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "13px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background:
                        "#f3f3f3",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <Icon
                      icon="solar:user-circle-bold"
                      width="25"
                    />
                  </div>

                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "20px",
                      }}
                    >
                      Contact Information
                    </h2>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        color: "#777",
                        fontSize:
                          "13px",
                      }}
                    >
                      Your account details
                    </p>
                  </div>
                </div>

                {/* PENCIL INSIDE SAME BOX */}

                {!editingContact && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingContact(
                        true
                      );
                      setError("");
                      setSuccess("");
                    }}
                    aria-label="Edit phone number"
                    style={{
                      width: "38px",
                      height: "38px",
                      border:
                        "1px solid #ddd",
                      background:
                        "#fff",
                      borderRadius:
                        "10px",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      cursor:
                        "pointer",
                    }}
                  >
                    <Icon
                      icon="solar:pen-bold"
                      width="17"
                    />
                  </button>
                )}
              </div>

              {/* CONTACT DETAILS */}

              {!editingContact ? (
                <div
                  className="contact-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(3, minmax(0, 1fr))",
                    gap: "15px",
                  }}
                >
                  {/* NAME */}

                  <div
                    style={{
                      padding: "17px",
                      background:
                        "#f7f7f7",
                      borderRadius:
                        "12px",
                    }}
                  >
                    <p
                      style={{
                        margin:
                          "0 0 7px",
                        color: "#888",
                        fontSize:
                          "11px",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.8px",
                      }}
                    >
                      Name
                    </p>

                    <strong
                      style={{
                        fontSize:
                          "14px",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {user?.name}
                    </strong>
                  </div>

                  {/* EMAIL */}

                  <div
                    style={{
                      padding: "17px",
                      background:
                        "#f7f7f7",
                      borderRadius:
                        "12px",
                    }}
                  >
                    <p
                      style={{
                        margin:
                          "0 0 7px",
                        color: "#888",
                        fontSize:
                          "11px",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.8px",
                      }}
                    >
                      Email
                    </p>

                    <strong
                      style={{
                        fontSize:
                          "14px",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {user?.email}
                    </strong>
                  </div>

                  {/* PHONE */}

                  <div
                    style={{
                      padding: "17px",
                      background:
                        "#f7f7f7",
                      borderRadius:
                        "12px",
                    }}
                  >
                    <p
                      style={{
                        margin:
                          "0 0 7px",
                        color: "#888",
                        fontSize:
                          "11px",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.8px",
                      }}
                    >
                      Phone
                    </p>

                    <strong
                      style={{
                        fontSize:
                          "14px",
                      }}
                    >
                      {user?.phone}
                    </strong>
                  </div>
                </div>
              ) : (
                /* PHONE EDIT MODE INSIDE SAME BOX */

                <div
                  style={{
                    background:
                      "#f8f8f8",
                    border:
                      "1px solid #e6e6e6",
                    borderRadius:
                      "14px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr auto auto",
                      gap: "10px",
                      alignItems:
                        "end",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display:
                            "block",
                          fontSize:
                            "12px",
                          fontWeight: 600,
                          marginBottom:
                            "7px",
                        }}
                      >
                        Phone Number
                      </label>

                      <input
                        type="text"
                        value={phone}
                        onChange={(e) =>
                          setPhone(
                            e.target.value
                          )
                        }
                        placeholder="+91 XXXXX XXXXX"
                        style={{
                          width: "100%",
                          boxSizing:
                            "border-box",
                          height: "48px",
                          border:
                            "1px solid #ddd",
                          borderRadius:
                            "10px",
                          padding:
                            "0 13px",
                          fontSize:
                            "14px",
                          outline:
                            "none",
                          background:
                            "#fff",
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={
                        saveContact
                      }
                      disabled={
                        savingContact
                      }
                      style={{
                        height: "48px",
                        border: "none",
                        borderRadius:
                          "10px",
                        background:
                          savingContact
                            ? "#777"
                            : "#111",
                        color: "#fff",
                        padding:
                          "0 17px",
                        cursor:
                          savingContact
                            ? "not-allowed"
                            : "pointer",
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "6px",
                        fontSize:
                          "13px",
                      }}
                    >
                      {savingContact ? (
                        <Icon
                          icon="solar:refresh-circle-bold"
                          width="17"
                          style={{
                            animation:
                              "spin 1s linear infinite",
                          }}
                        />
                      ) : (
                        <Icon
                          icon="solar:check-circle-bold"
                          width="17"
                        />
                      )}

                      Save
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPhone(
                          user?.phone ||
                            ""
                        );

                        setEditingContact(
                          false
                        );

                        setError("");
                      }}
                      style={{
                        height: "48px",
                        border:
                          "1px solid #ddd",
                        borderRadius:
                          "10px",
                        background:
                          "#fff",
                        padding:
                          "0 15px",
                        cursor:
                          "pointer",
                        fontSize:
                          "13px",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "7px",
                  marginTop: "16px",
                  color: "#777",
                  fontSize: "12px",
                }}
              >
                <Icon
                  icon="solar:check-circle-bold"
                  width="16"
                />

                Logged in as{" "}
                {user?.email}
              </div>
            </section>

            {/* =========================
                DELIVERY ADDRESS
            ========================= */}

            <section
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "30px",
                border:
                  "1px solid #ededed",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: "15px",
                  marginBottom: "25px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "13px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius:
                        "12px",
                      background:
                        "#f3f3f3",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <Icon
                      icon="solar:map-point-bold"
                      width="25"
                    />
                  </div>

                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize:
                          "20px",
                      }}
                    >
                      Delivery Address
                    </h2>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        color: "#777",
                        fontSize:
                          "13px",
                      }}
                    >
                      Your saved delivery
                      address
                    </p>
                  </div>
                </div>

                {/* ADDRESS PENCIL */}

                {!editingAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddress(
                        true
                      );
                      setError("");
                      setSuccess("");
                    }}
                    aria-label="Edit address"
                    style={{
                      width: "38px",
                      height: "38px",
                      border:
                        "1px solid #ddd",
                      background:
                        "#fff",
                      borderRadius:
                        "10px",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      cursor:
                        "pointer",
                    }}
                  >
                    <Icon
                      icon="solar:pen-bold"
                      width="17"
                    />
                  </button>
                )}
              </div>

              {/* SAVED ADDRESS */}

              {!editingAddress ? (
                <div
                  style={{
                    border:
                      "1px solid #e8e8e8",
                    borderRadius:
                      "14px",
                    padding: "20px",
                    background:
                      "#fafafa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin:
                            "0 0 7px",
                          fontSize:
                            "11px",
                          color: "#888",
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.8px",
                        }}
                      >
                        Deliver To
                      </p>

                      <strong
                        style={{
                          fontSize:
                            "15px",
                        }}
                      >
                        {user?.name}
                      </strong>

                      <p
                        style={{
                          margin:
                            "8px 0 0",
                          color:
                            "#555",
                          fontSize:
                            "14px",
                          lineHeight:
                            1.6,
                        }}
                      >
                        {user?.address}
                        <br />

                        {user?.city},{" "}
                        {user?.state}
                        <br />

                        PIN:{" "}
                        {user?.pincode}
                      </p>
                    </div>

                    <Icon
                      icon="solar:check-circle-bold"
                      width="23"
                      height="23"
                    />
                  </div>
                </div>
              ) : (
                /* ADDRESS EDIT */

                <div>
                  <label
                    style={{
                      display:
                        "block",
                      fontSize:
                        "13px",
                      fontWeight: 600,
                      marginBottom:
                        "8px",
                    }}
                  >
                    Full Address
                  </label>

                  <textarea
                    name="address"
                    value={
                      addressData.address
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="House number, street, area"
                    rows={4}
                    style={{
                      width: "100%",
                      boxSizing:
                        "border-box",
                      resize:
                        "vertical",
                      border:
                        "1px solid #ddd",
                      borderRadius:
                        "12px",
                      padding: "15px",
                      fontSize:
                        "14px",
                      outline:
                        "none",
                      fontFamily:
                        "inherit",
                    }}
                  />

                  <div
                    className="address-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(3, minmax(0, 1fr))",
                      gap: "18px",
                      marginTop:
                        "20px",
                    }}
                  >
                    {/* CITY */}

                    <div>
                      <label
                        style={{
                          display:
                            "block",
                          fontSize:
                            "13px",
                          fontWeight: 600,
                          marginBottom:
                            "8px",
                        }}
                      >
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={
                          addressData.city
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="City"
                        style={{
                          width: "100%",
                          boxSizing:
                            "border-box",
                          height:
                            "54px",
                          border:
                            "1px solid #ddd",
                          borderRadius:
                            "12px",
                          padding:
                            "0 15px",
                          fontSize:
                            "14px",
                          outline:
                            "none",
                        }}
                      />
                    </div>

                    {/* STATE */}

                    <div>
                      <label
                        style={{
                          display:
                            "block",
                          fontSize:
                            "13px",
                          fontWeight: 600,
                          marginBottom:
                            "8px",
                        }}
                      >
                        State
                      </label>

                      <input
                        type="text"
                        name="state"
                        value={
                          addressData.state
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="State"
                        style={{
                          width: "100%",
                          boxSizing:
                            "border-box",
                          height:
                            "54px",
                          border:
                            "1px solid #ddd",
                          borderRadius:
                            "12px",
                          padding:
                            "0 15px",
                          fontSize:
                            "14px",
                          outline:
                            "none",
                        }}
                      />
                    </div>

                    {/* PIN */}

                    <div>
                      <label
                        style={{
                          display:
                            "block",
                          fontSize:
                            "13px",
                          fontWeight: 600,
                          marginBottom:
                            "8px",
                        }}
                      >
                        PIN Code
                      </label>

                      <input
                        type="text"
                        name="pincode"
                        value={
                          addressData.pincode
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="6-digit PIN"
                        maxLength={6}
                        inputMode="numeric"
                        style={{
                          width: "100%",
                          boxSizing:
                            "border-box",
                          height:
                            "54px",
                          border:
                            "1px solid #ddd",
                          borderRadius:
                            "12px",
                          padding:
                            "0 15px",
                          fontSize:
                            "14px",
                          outline:
                            "none",
                        }}
                      />
                    </div>
                  </div>

                  {/* SAVE / CANCEL */}

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop:
                        "22px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={
                        saveAddress
                      }
                      disabled={
                        savingAddress
                      }
                      style={{
                        border: "none",
                        background:
                          savingAddress
                            ? "#777"
                            : "#111",
                        color: "#fff",
                        borderRadius:
                          "10px",
                        padding:
                          "12px 20px",
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "7px",
                        cursor:
                          savingAddress
                            ? "not-allowed"
                            : "pointer",
                        fontSize:
                          "13px",
                      }}
                    >
                      {savingAddress ? (
                        <Icon
                          icon="solar:refresh-circle-bold"
                          width="17"
                          style={{
                            animation:
                              "spin 1s linear infinite",
                          }}
                        />
                      ) : (
                        <Icon
                          icon="solar:check-circle-bold"
                          width="17"
                        />
                      )}

                      Save Address
                    </button>

                    {user?.address && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddressData(
                            {
                              address:
                                user.address ||
                                "",
                              city:
                                user.city ||
                                "",
                              state:
                                user.state ||
                                "",
                              pincode:
                                user.pincode ||
                                "",
                            }
                          );

                          setEditingAddress(
                            false
                          );

                          setError("");
                        }}
                        style={{
                          border:
                            "1px solid #ddd",
                          background:
                            "#fff",
                          color:
                            "#333",
                          borderRadius:
                            "10px",
                          padding:
                            "12px 20px",
                          cursor:
                            "pointer",
                          fontSize:
                            "13px",
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* =========================
                PAYMENT METHOD
            ========================= */}

            <section
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "30px",
                border:
                  "1px solid #ededed",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "13px",
                  marginBottom:
                    "25px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius:
                      "12px",
                    background:
                      "#f3f3f3",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <Icon
                    icon="solar:card-bold"
                    width="24"
                  />
                </div>

                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize:
                        "20px",
                    }}
                  >
                    Payment Method
                  </h2>

                  <p
                    style={{
                      margin:
                        "4px 0 0",
                      color:
                        "#777",
                      fontSize:
                        "13px",
                    }}
                  >
                    Choose how you want
                    to pay
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {/* COD */}

                <button
                  type="button"
                  onClick={() =>
                    handlePaymentChange(
                      "cod"
                    )
                  }
                  style={{
                    width: "100%",
                    border:
                      paymentMethod ===
                      "cod"
                        ? "1.5px solid #111"
                        : "1px solid #ddd",
                    borderRadius:
                      "14px",
                    padding:
                      "18px",
                    background:
                      paymentMethod ===
                      "cod"
                        ? "#fafafa"
                        : "#fff",
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "14px",
                    textAlign:
                      "left",
                    cursor:
                      "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      minWidth:
                        "46px",
                      borderRadius:
                        "12px",
                      background:
                        "#f1f1f1",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <Icon
                      icon="solar:wallet-money-bold"
                      width="25"
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <strong
                      style={{
                        display:
                          "block",
                        fontSize:
                          "15px",
                      }}
                    >
                      Cash on Delivery
                    </strong>

                    <span
                      style={{
                        display:
                          "block",
                        marginTop:
                          "5px",
                        color:
                          "#777",
                        fontSize:
                          "12px",
                      }}
                    >
                      Pay when your
                      order is delivered
                    </span>
                  </div>

                  <div
                    style={{
                      width:
                        "21px",
                      height:
                        "21px",
                      borderRadius:
                        "50%",
                      border:
                        paymentMethod ===
                        "cod"
                          ? "6px solid #111"
                          : "1px solid #aaa",
                      boxSizing:
                        "border-box",
                    }}
                  />
                </button>

                {/* ONLINE */}

                <button
                  type="button"
                  onClick={() =>
                    handlePaymentChange(
                      "online"
                    )
                  }
                  style={{
                    width: "100%",
                    border:
                      paymentMethod ===
                      "online"
                        ? "1.5px solid #111"
                        : "1px solid #ddd",
                    borderRadius:
                      "14px",
                    padding:
                      "18px",
                    background:
                      paymentMethod ===
                      "online"
                        ? "#fafafa"
                        : "#fff",
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "14px",
                    textAlign:
                      "left",
                    cursor:
                      "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      minWidth:
                        "46px",
                      borderRadius:
                        "12px",
                      background:
                        "#f1f1f1",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <Icon
                      icon="solar:card-transfer-bold"
                      width="25"
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "8px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <strong
                        style={{
                          fontSize:
                            "15px",
                        }}
                      >
                        Online Payment
                      </strong>

                      <span
                        style={{
                          background:
                            "#eee",
                          padding:
                            "4px 7px",
                          borderRadius:
                            "5px",
                          fontSize:
                            "10px",
                          color:
                            "#666",
                        }}
                      >
                        RAZORPAY
                      </span>
                    </div>

                    <span
                      style={{
                        display:
                          "block",
                        marginTop:
                          "5px",
                        color:
                          "#777",
                        fontSize:
                          "12px",
                      }}
                    >
                      Pay securely
                      online
                    </span>
                  </div>

                  <div
                    style={{
                      width:
                        "21px",
                      height:
                        "21px",
                      borderRadius:
                        "50%",
                      border:
                        paymentMethod ===
                        "online"
                          ? "6px solid #111"
                          : "1px solid #aaa",
                      boxSizing:
                        "border-box",
                    }}
                  />
                </button>
              </div>
            </section>
          </div>

          {/* =========================
              ORDER SUMMARY
          ========================= */}

          <aside
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "30px",
              position: "sticky",
              top: "110px",
              border:
                "1px solid #ededed",
            }}
          >
            <h2
              style={{
                margin:
                  "0 0 25px",
                fontSize: "21px",
              }}
            >
              Order Summary
            </h2>

            {/* PRODUCTS */}

            <div
              style={{
                display: "grid",
                gap: "15px",
                paddingBottom:
                  "20px",
                borderBottom:
                  "1px solid #eee",
              }}
            >
              {cartItems.map(
                (item, index) => (
                  <div
                    key={`${item.product.id}-${index}`}
                    style={{
                      display:
                        "flex",
                      gap: "13px",
                      alignItems:
                        "center",
                    }}
                  >
                    <img
                      src={
                        item.product
                          .image
                      }
                      alt={
                        item.product
                          .name
                      }
                      style={{
                        width: "75px",
                        height:
                          "88px",
                        objectFit:
                          "cover",
                        borderRadius:
                          "10px",
                        background:
                          "#f3f3f3",
                      }}
                    />

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <strong
                        style={{
                          display:
                            "block",
                          fontSize:
                            "14px",
                          marginBottom:
                            "5px",
                        }}
                      >
                        {
                          item
                            .product
                            .name
                        }
                      </strong>

                      <span
                        style={{
                          display:
                            "block",
                          color:
                            "#777",
                          fontSize:
                            "12px",
                        }}
                      >
                        Qty:{" "}
                        {
                          item.quantity
                        }

                        {item.size &&
                          ` · Size: ${item.size}`}

                        {item.color &&
                          ` · ${item.color}`}
                      </span>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "8px",
                          fontSize:
                            "14px",
                        }}
                      >
                        ₹
                        {(
                          item
                            .product
                            .price *
                          item.quantity
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* PRICE */}

            <div
              style={{
                display: "grid",
                gap: "15px",
                padding:
                  "20px 0",
                borderBottom:
                  "1px solid #eee",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  fontSize:
                    "14px",
                  color: "#666",
                }}
              >
                <span>
                  Subtotal
                </span>

                <span>
                  ₹
                  {cartTotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  fontSize:
                    "14px",
                  color: "#666",
                }}
              >
                <span>
                  Shipping
                </span>

                <span>
                  {shipping === 0
                    ? "FREE"
                    : `₹${shipping.toLocaleString(
                        "en-IN"
                      )}`}
                </span>
              </div>
            </div>

            {/* TOTAL */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                padding:
                  "22px 0",
              }}
            >
              <strong
                style={{
                  fontSize:
                    "18px",
                }}
              >
                Total
              </strong>

              <strong
                style={{
                  fontSize:
                    "22px",
                }}
              >
                ₹
                {total.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            {/* ERROR */}

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "flex-start",
                  gap: "8px",
                  background:
                    "#fff3f3",
                  border:
                    "1px solid #ffd4d4",
                  color:
                    "#b42318",
                  padding: "12px",
                  borderRadius:
                    "10px",
                  fontSize:
                    "13px",
                  lineHeight:
                    1.5,
                  marginBottom:
                    "15px",
                }}
              >
                <Icon
                  icon="solar:danger-circle-bold"
                  width="18"
                />

                <span>
                  {error}
                </span>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "7px",
                  background:
                    "#f0faf4",
                  border:
                    "1px solid #ccebd8",
                  color:
                    "#237a45",
                  padding:
                    "11px 13px",
                  borderRadius:
                    "10px",
                  marginBottom:
                    "15px",
                  fontSize:
                    "13px",
                }}
              >
                <Icon
                  icon="solar:check-circle-bold"
                  width="17"
                />

                {success}
              </div>
            )}

            {/* PLACE ORDER */}

            <button
              type="button"
              onClick={
                handlePlaceOrder
              }
              disabled={
                placingOrder ||
                savingAddress ||
                savingContact
              }
              style={{
                width: "100%",
                height: "62px",
                border: "none",
                borderRadius:
                  "35px",
                background:
                  placingOrder
                    ? "#777"
                    : "#111",
                color: "#fff",
                fontSize:
                  "15px",
                fontWeight: 600,
                cursor:
                  placingOrder
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: "10px",
              }}
            >
              {placingOrder ? (
                <>
                  <Icon
                    icon="solar:refresh-circle-bold"
                    width="20"
                    style={{
                      animation:
                        "spin 1s linear infinite",
                    }}
                  />

                  {paymentMethod === "online"
                    ? "Opening Payment..."
                    : "Placing Order..."}
                </>
              ) : paymentMethod ===
                "cod" ? (
                <>
                  Place COD Order

                  <Icon
                    icon="solar:arrow-right-linear"
                    width="20"
                  />
                </>
              ) : (
                <>
                  Online Payment

                  <Icon
                    icon="solar:card-transfer-bold"
                    width="20"
                  />
                </>
              )}
            </button>

            {/* BACK */}

            <Link
              href="/cart"
              style={{
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: "7px",
                marginTop:
                  "20px",
                color: "#777",
                textDecoration:
                  "none",
                fontSize:
                  "13px",
              }}
            >
              <Icon
                icon="solar:arrow-left-linear"
                width="17"
              />

              Back to Cart
            </Link>
          </aside>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }

          aside {
            position: static !important;
          }
        }

        @media (max-width: 700px) {
          .contact-grid,
          .address-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 500px) {
          .checkout-grid {
            gap: 18px !important;
          }
        }
      `}</style>
    </main>
  );
}