"use client";

import { X } from "lucide-react";
import OrderSummary from "@/app/components/order/OrderSummary";

interface CartSheetProps {
  onClose: () => void;
}

export default function CartSheet({ onClose }: CartSheetProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your order"
      className="fixed inset-0 z-[60] flex items-end justify-center"
    >
      <button
        aria-label="Close order summary"
        onClick={onClose}
        className="absolute inset-0 bg-[#1F1A17]/40"
      />

      <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-[32px] bg-[#FBF7F2] px-4 pb-6 pt-3 sm:max-w-md">
        <span
          aria-hidden="true"
          className="mx-auto mb-3 block h-1.5 w-12 rounded-full bg-[#1F1A17]/15"
        />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#1F1A17]/60 hover:text-[#C1442D]"
        >
          <X size={20} />
        </button>

        <OrderSummary onProceed={onClose} />
      </div>
    </div>
  );
}
