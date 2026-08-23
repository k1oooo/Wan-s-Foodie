export interface DeliveryFeeTier {
  maxKm: number;
  fee: number;
}

// Distance-based ESTIMATE only — the real delivery fee is always confirmed
// manually via WhatsApp (see the note on the checkout form). The live tier
// table is stored in site_settings.delivery_fee_tiers and editable from
// Admin > Settings. DEFAULT_DELIVERY_FEE_TIERS below is only a fallback if
// that row is ever missing or unreachable — see lib/supabase/settings.ts.
export const DEFAULT_DELIVERY_FEE_TIERS: DeliveryFeeTier[] = [
  { maxKm: 3, fee: 2 },
  { maxKm: 5, fee: 3 },
  { maxKm: 8, fee: 5 },
  { maxKm: 12, fee: 7 },
  { maxKm: 15, fee: 10 },
];

export interface DeliveryFeeEstimate {
  /** Null when the address falls outside every tier (see inRange). */
  fee: number | null;
  /** False once distance exceeds the last tier's maxKm — still deliverable
   * in principle, just needs a manual quote instead of an automatic one. */
  inRange: boolean;
}

export function estimateDeliveryFee(
  distanceKm: number,
  tiers: DeliveryFeeTier[] = DEFAULT_DELIVERY_FEE_TIERS,
): DeliveryFeeEstimate {
  // Sort defensively rather than trusting storage order — admin could save
  // tiers out of sequence, and this still needs to pick the smallest
  // matching tier either way.
  const sorted = [...tiers].sort((a, b) => a.maxKm - b.maxKm);

  for (const tier of sorted) {
    if (distanceKm <= tier.maxKm) {
      return { fee: tier.fee, inRange: true };
    }
  }
  return { fee: null, inRange: false };
}
