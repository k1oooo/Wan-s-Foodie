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
    // for an hour (via Next's fetch cache). It's looked up first (rather
    // than in parallel with the destination) because the destination
    // lookup needs its coordinates to bias against — see the comment on
    // geocodeAddress's `bias` option.
    const origin = await geocodeAddress(settings.pickup_address, {
      revalidateSeconds: 3600,
    });

    if (!origin) {
      return NextResponse.json({ ok: false, reason: "geocode_failed" });
    }

    const destination = await geocodeAddress(address, {
      bias: { lat: origin.lat, lon: origin.lon, radiusKm: 60 },
    });

    if (!destination) {
      return NextResponse.json({ ok: false, reason: "geocode_failed" });
    }

    const distanceKm = haversineDistanceKm(origin, destination);
    const { fee, inRange } = estimateDeliveryFee(
      distanceKm,
      settings.delivery_fee_tiers,
    );

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
