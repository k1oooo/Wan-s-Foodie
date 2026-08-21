import { AlertTriangle, Boxes, Clock3 } from "lucide-react";
import type { StockState } from "@/lib/stock";

interface StockBadgeProps {
  state: StockState;
  stockBoxes: number;
  preorderMinimumBoxes: number;
}

/**
 * Small pill badge communicating stock status. Reused on both the
 * interactive order page and the read-only homepage menu preview, so it
 * stays presentation-only — callers own the ordering logic (min/max
 * quantities, disabled states, etc).
 */
export default function StockBadge({
  state,
  stockBoxes,
  preorderMinimumBoxes,
}: StockBadgeProps) {
  if (state === "unavailable") {
    return (
      <span className="inline-flex shrink-0 -rotate-3 items-center rounded border border-[#7A6F68]/40 px-1.5 py-0.5 font-nunito text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7A6F68]">
        Sold Out
      </span>
    );
  }

  if (state === "preorder") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#C1442D]/10 px-2 py-0.5 font-nunito text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#C1442D]">
        <Clock3 size={11} aria-hidden="true" />
        Pre-Order · Min {preorderMinimumBoxes}
      </span>
    );
  }

  if (state === "low-stock") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#E3A73B]/15 px-2 py-0.5 font-nunito text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#C1442D]">
        <AlertTriangle size={11} aria-hidden="true" />
        {stockBoxes} {stockBoxes === 1 ? "Box" : "Boxes"} Left
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1F1A17]/5 px-2 py-0.5 font-nunito text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#7A6F68]">
      <Boxes size={11} aria-hidden="true" />
      {stockBoxes} {stockBoxes === 1 ? "Box" : "Boxes"} Left
    </span>
  );
}
