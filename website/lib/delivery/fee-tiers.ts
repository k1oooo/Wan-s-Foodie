export interface DeliveryFeeTier {
  maxKm: number;
  fee: number;
}

// Distance-based ESTIMATE only — the real delivery fee is always confirmed
// manually via WhatsApp (see the note on the checkout form). Starting point
// based on the two example tiers Wan gave (≤3km → RM2, ≤5km → RM3); the
// rest scale the same way. This is a plain array, not wired to the Admin
// Settings panel — Wan asked to edit this file herself if the numbers need
// changing, rather than adding another settings UI for it.
export const DELIVERY_FEE_TIERS: DeliveryFeeTier[] = [
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

export function estimateDeliveryFee(distanceKm: number): DeliveryFeeEstimate {
  for (const tier of DELIVERY_FEE_TIERS) {
    if (distanceKm <= tier.maxKm) {
      return { fee: tier.fee, inRange: true };
    }
  }
  return { fee: null, inRange: false };
}
