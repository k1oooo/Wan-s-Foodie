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
    // for an hour. That also keeps us comfortably under Nominatim's
    // 1-request/second usage policy, since only the customer's address
    // needs a fresh lookup on each call.
    const origin = await geocodeAddress(settings.pickup_address, {
      revalidateSeconds: 3600,
    });
    const destination = await geocodeAddress(address);

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
