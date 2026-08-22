import { NextResponse } from "next/server";
import { geocodeAddress, haversineDistanceKm } from "@/lib/delivery/geocode";
import { estimateDeliveryFee } from "@/lib/delivery/fee-tiers";
import { getSiteSettings } from "@/lib/supabase/settings";

export async function POST(request: Request) {
  let body: { address?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_request" },
      { status: 400 },
    );
  }

  const address = body.address?.trim();
  if (!address) {
    return NextResponse.json(
      { ok: false, reason: "invalid_request" },
      { status: 400 },
    );
  }

  try {
    const settings = await getSiteSettings();

    // The pickup address rarely changes, so its geocode result is cached
    // for an hour (via Next's fetch cache) — in practice this means only
    // the customer's address triggers a live Nominatim call most of the
    // time. Run both in parallel since they're independent lookups.
    const [origin, destination] = await Promise.all([
      geocodeAddress(settings.pickup_address, { revalidateSeconds: 3600 }),
      geocodeAddress(address),
    ]);

    if (!origin || !destination) {
      return NextResponse.json({ ok: false, reason: "geocode_failed" });
    }

    const distanceKm = haversineDistanceKm(origin, destination);
    const { fee, inRange } = estimateDeliveryFee(distanceKm);

    return NextResponse.json({
      ok: true,
      distanceKm: Math.round(distanceKm * 10) / 10,
      fee,
      inRange,
    });
  } catch (error) {
    console.error("Delivery estimate failed:", error);
    return NextResponse.json({ ok: false, reason: "unavailable" });
  }
}
