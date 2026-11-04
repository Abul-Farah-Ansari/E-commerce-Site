/**
 * Server-only Shiprocket API helper.
 * Never import this module into a Client Component.
 */

type ShiprocketAuthResponse = {
  token?: string;
  id?: number;
  first_name?: string;
  message?: string;
  errors?: unknown;
};

type CachedShiprocketAuth = {
  token: string;
  id?: number;
  firstName?: string;
  expiresAt: number;
};

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_CACHE_DURATION_MS = 9 * 24 * 60 * 60 * 1000;

/**
 * Safe by default: external Shiprocket operations stay simulated unless the
 * server environment explicitly sets SHIPROCKET_MODE=live.
 */
export type ShiprocketMode = "test" | "live";

export function getShiprocketMode(): ShiprocketMode {
  return process.env.SHIPROCKET_MODE?.trim().toLowerCase() === "live"
    ? "live"
    : "test";
}

export type ShiprocketCourierOption = {
  courierId: number;
  courierName: string;
  estimatedDeliveryDays?: string;
};

/** Local demo data only; these are not real Shiprocket courier services. */
export const TEST_SHIPROCKET_COURIERS: ShiprocketCourierOption[] = [
  { courierId: 99001, courierName: "TEST Courier - Standard", estimatedDeliveryDays: "3-5" },
  { courierId: 99002, courierName: "TEST Courier - Express", estimatedDeliveryDays: "1-2" },
];

let cachedAuth: CachedShiprocketAuth | null = null;

export async function getShiprocketAuth(): Promise<CachedShiprocketAuth> {
  if (cachedAuth && cachedAuth.expiresAt > Date.now()) {
    return cachedAuth;
  }

  const email = process.env.SHIPROCKET_EMAIL?.trim();
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Shiprocket is not configured. Add SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD to .env.local."
    );
  }

  let response: Response;
  try {
    response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach Shiprocket authentication service.");
  }

  const data = (await response.json().catch(() => ({}))) as ShiprocketAuthResponse;
  if (!response.ok || typeof data.token !== "string" || !data.token) {
    const detail =
      typeof data.message === "string" && data.message.trim()
        ? ` ${data.message.trim()}`
        : "";
    throw new Error(`Shiprocket authentication failed (HTTP ${response.status}).${detail}`);
  }

  cachedAuth = {
    token: data.token,
    id: data.id,
    firstName: data.first_name,
    expiresAt: Date.now() + TOKEN_CACHE_DURATION_MS,
  };
  return cachedAuth;
}

export function clearShiprocketAuthCache(): void {
  cachedAuth = null;
}

type ShiprocketRequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

/** Makes an authenticated server-side Shiprocket API request. */
export async function shiprocketRequest<T = unknown>(
  path: string,
  options: ShiprocketRequestOptions = {}
): Promise<T> {
  if (!path.startsWith("/")) {
    throw new Error("Shiprocket API path must start with '/'.");
  }

  const method = options.method || "GET";
  let auth = await getShiprocketAuth();

  const send = async (token: string) => {
    const response = await fetch(`${SHIPROCKET_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const candidate = data as { message?: unknown; errors?: unknown; error?: unknown };
      const details =
        typeof candidate.message === "string"
          ? candidate.message
          : typeof candidate.error === "string"
            ? candidate.error
            : Array.isArray(candidate.errors)
              ? candidate.errors.map(String).join("; ")
              : candidate.errors && typeof candidate.errors === "object"
                ? JSON.stringify(candidate.errors)
                : "Shiprocket rejected the request.";
      const error = new Error(`Shiprocket API failed (HTTP ${response.status}): ${details}`);
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }

    const candidate = data as { status?: unknown; success?: unknown; message?: unknown };
    if (candidate.success === false || candidate.status === 0 || candidate.status === "0") {
      throw new Error(
        typeof candidate.message === "string"
          ? candidate.message
          : "Shiprocket returned an unsuccessful response."
      );
    }

    return data as T;
  };

  try {
    return await send(auth.token);
  } catch (error) {
    const status = (error as Error & { status?: number })?.status;
    if (status !== 401) throw error;
    clearShiprocketAuthCache();
    auth = await getShiprocketAuth();
    return send(auth.token);
  }
}
