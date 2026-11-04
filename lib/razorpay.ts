import Razorpay from "razorpay";

/**
 * Create the Razorpay SDK lazily so Next.js can build without evaluating
 * credentials at module-import time. Both values must exist server-side.
 */
export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_CONFIG_MISSING");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function getRazorpayKeyId() {
  const keyId = process.env.RAZORPAY_KEY_ID;

  if (!keyId) {
    throw new Error("RAZORPAY_CONFIG_MISSING");
  }

  // The Key ID is public and is passed to Checkout. Never return the secret.
  return keyId;
}
