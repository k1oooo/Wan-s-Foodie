import type { OrderStatus } from "./types";

// Once an order is marked completed or cancelled, the admin has this long
// to fix mistakes before the order locks and can no longer be edited.
export const LOCK_WINDOW_MS = 24 * 60 * 60 * 1000;

// Only these statuses start the lock countdown.
export const LOCKABLE_STATUSES: OrderStatus[] = [
  "completed",
  "cancelled",
  "refunded",
];

export function isLockableStatus(status: OrderStatus): boolean {
  return LOCKABLE_STATUSES.includes(status);
}

export interface LockState {
  /** True once `now` has passed 24h after status_finalized_at. */
  isLocked: boolean;
  /** True if this order is on the lock countdown but not locked yet. */
  isCountingDown: boolean;
  /** When the order becomes locked, if it's on the countdown. */
  unlocksAt: Date | null;
  /** Milliseconds remaining until lock, clamped to 0. */
  msRemaining: number;
}

export function getLockState(
  statusFinalizedAt: string | null | undefined,
  now: number,
): LockState {
  if (!statusFinalizedAt) {
    return {
      isLocked: false,
      isCountingDown: false,
      unlocksAt: null,
      msRemaining: 0,
    };
  }

  const finalizedAtMs = new Date(statusFinalizedAt).getTime();
  const unlocksAtMs = finalizedAtMs + LOCK_WINDOW_MS;
  const msRemaining = Math.max(0, unlocksAtMs - now);
  const isLocked = msRemaining <= 0;

  return {
    isLocked,
    isCountingDown: !isLocked,
    unlocksAt: new Date(unlocksAtMs),
    msRemaining,
  };
}

/** Formats remaining ms as e.g. "23h 12m" or "42m" when under an hour. */
export function formatRemaining(ms: number): string {
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
