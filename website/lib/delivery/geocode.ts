// Geocoding via LocationIQ, used only to produce a rough delivery-fee
// ESTIMATE — never anything customer-facing that needs to be precise (the
// real fee is always confirmed manually via WhatsApp).
//
// This was originally built against the public OpenStreetMap Nominatim
// endpoint (fully free, no signup), but that instance actively blocks or
// silently stalls requests coming from datacenter/cloud IPs — exactly what
// Vercel's serverless functions use — which made every lookup fail in
// production. LocationIQ is Nominatim-compatible (same request/response
// shape, same open data) but is proper hosted infrastructure meant for
// production traffic, with a free tier (5,000 requests/day) that comfortably
// covers a small home business. Swapping providers again later, if ever
// needed, is a one-file change.
//
// Get a free key at https://locationiq.com (no credit card) and set it as
// LOCATIONIQ_API_KEY in Vercel's environment variables.

const LOCATIONIQ_URL = "https://us1.locationiq.com/v1/search";

export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Looks up coordinates for a free-text address. Returns null (rather than
 * throwing) on "not found", missing API key, or any network/parsing
 * failure, since a failed estimate should never block checkout — it just
 * means the delivery-fee estimate is skipped and the existing "confirmed
 * via WhatsApp" note is all the customer sees.
 */
export async function geocodeAddress(
  address: string,
  options?: { revalidateSeconds?: number },
): Promise<Coordinates | null> {
  const apiKey = process.env.LOCATIONIQ_API_KEY;
  if (!apiKey) {
    console.error(
      "LOCATIONIQ_API_KEY is not set — delivery fee estimates are disabled until it's configured.",
    );
    return null;
  }

  const url = `${LOCATIONIQ_URL}?key=${apiKey}&format=json&limit=1&countrycodes=my&q=${encodeURIComponent(
    address,
  )}`;

  try {
    const res = await fetch(url, {
      // A generous but bounded timeout — LocationIQ is reliable, but this
      // still protects against the customer getting stuck on
      // "Estimating..." indefinitely if something goes wrong.
      signal: AbortSignal.timeout(5000),
      next: options?.revalidateSeconds
        ? { revalidate: options.revalidateSeconds }
        : undefined,
    });

    if (!res.ok) {
      console.error(
        `LocationIQ geocode request failed: ${res.status} ${res.statusText}`,
      );
      return null;
    }

    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (results.length === 0) return null;

    const lat = parseFloat(results[0].lat);
    const lon = parseFloat(results[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

    return { lat, lon };
  } catch (error) {
    console.error("LocationIQ geocode failed:", error);
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
