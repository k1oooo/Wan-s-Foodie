// Free geocoding via OpenStreetMap's Nominatim, used only to produce a
// rough delivery-fee ESTIMATE — never anything customer-facing that needs
// to be precise (the real fee is always confirmed manually via WhatsApp).
// This keeps the estimate free instead of requiring a billed Google Maps
// API key. Trade-off: Nominatim can be less accurate for free-text
// Malaysian addresses and is rate-limited to ~1 request/second — acceptable
// for a small home-based business, but worth revisiting if order volume
// grows enough to strain it.
//
// Usage policy: https://operations.osmfoundation.org/policies/nominatim/

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy requires a valid identifying User-Agent.
const USER_AGENT = "WansFoodiesWebsite/1.0 (+https://wansfoodies.com)";

export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Looks up coordinates for a free-text address. Returns null (rather than
 * throwing) on "not found" or any network/parsing failure, since a failed
 * estimate should never block checkout — it just means the delivery-fee
 * estimate is skipped and the existing "confirmed via WhatsApp" note is all
 * the customer sees.
 */
export async function geocodeAddress(
  address: string,
  options?: { revalidateSeconds?: number },
): Promise<Coordinates | null> {
  const url = `${NOMINATIM_URL}?format=json&limit=1&countrycodes=my&q=${encodeURIComponent(
    address,
  )}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      // Nominatim can hang or silently stall on requests from datacenter
      // IPs (which is what Vercel's serverless functions are) without
      // ever erroring — cap it so a bad lookup fails fast instead of
      // leaving the customer staring at "Estimating..." indefinitely.
      signal: AbortSignal.timeout(5000),
      next: options?.revalidateSeconds
        ? { revalidate: options.revalidateSeconds }
        : undefined,
    });

    if (!res.ok) return null;

    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (results.length === 0) return null;

    const lat = parseFloat(results[0].lat);
    const lon = parseFloat(results[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

    return { lat, lon };
  } catch (error) {
    console.error("Nominatim geocode failed:", error);
    return null;
  }
}

/** Great-circle distance between two coordinates, in kilometers. */
export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const EARTH_RADIUS_KM = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}
