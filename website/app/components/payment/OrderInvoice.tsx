"use client";

import { CheckCircle2, RotateCcw, Store, Truck } from "lucide-react";
import Button from "@/app/ui/Button";
import type { CartLine } from "@/lib/cart-context";
import { formatRM, type DeliveryMethod } from "@/lib/order-utils";

export interface ConfirmedOrder {
  orderNumber: string;
  items: CartLine[];
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  sentAt: string;
}

interface OrderInvoiceProps {
  order: ConfirmedOrder;
  /** From live site settings (Admin > Settings). */
  pickupAddress: string;
  onRetryWhatsApp: () => void;
  onStartNewOrder: () => void;
}

export default function OrderInvoice({
  order,
  pickupAddress,
  onRetryWhatsApp,
  onStartNewOrder,
}: OrderInvoiceProps) {
  const sentAtLabel = new Date(order.sentAt).toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-[28px] border-2 border-dashed border-[#1F1A17]/20 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="text-center">
        <CheckCircle2 className="mx-auto text-[#C1442D]" size={36} />
        <h2 className="mt-2 font-nunito text-xl font-extrabold tracking-[-0.04em] text-[#1F1A17]">
          Order Sent!
        </h2>
        <p className="mt-1 text-sm text-[#7A6F68]">
          Your order has been sent to Wan&apos;s Foodies via WhatsApp.
          We&apos;ll confirm shortly.
        </p>
      </div>

      {/* Order # + timestamp */}
      <div className="mt-4 flex items-center justify-between border-y border-dashed border-[#1F1A17]/20 py-2.5 text-sm">
        <span className="font-nunito font-extrabold text-[#C1442D]">
          Order #{order.orderNumber}
        </span>
        <span className="text-[#7A6F68]">{sentAtLabel}</span>
      </div>

      {/* Itemized list */}
      <div className="mt-4 space-y-1.5">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-baseline justify-between gap-3 text-sm text-[#1F1A17]"
          >
            <span className="min-w-0 truncate">
              {item.name}{" "}
              <span className="text-[#7A6F68]">x{item.quantity}</span>
            </span>
            <span className="shrink-0 tabular-nums">
              {formatRM(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#1F1A17]/20 pt-3 font-nunito text-base font-extrabold text-[#1F1A17]">
        <span>Total</span>
        <span className="text-[#C1442D]">{formatRM(order.total)}</span>
      </div>

      {/* Customer + fulfilment info */}
      <div className="mt-4 space-y-1.5 border-t border-dashed border-[#1F1A17]/20 pt-3.5 text-sm text-[#1F1A17]">
        <div className="flex items-center justify-between">
          <span className="text-[#7A6F68]">Name</span>
          <span className="font-medium">{order.customerName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#7A6F68]">Phone</span>
          <span className="font-medium">{order.customerPhone}</span>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="shrink-0 text-[#7A6F68]">Fulfilment</span>
          <span className="flex items-start gap-1.5 text-right font-medium">
            {order.deliveryMethod === "delivery" ? (
              <>
                <span>
                  Delivery
                  {order.address && (
                    <span className="block font-normal text-[#7A6F68]">
                      {order.address}
                    </span>
                  )}
                </span>
                <Truck size={16} className="mt-0.5 shrink-0 text-[#C1442D]" />
              </>
            ) : (
              <>
                <span>
                  Self pickup
                  <span className="block font-normal text-[#7A6F68]">
                    {pickupAddress}
                  </span>
                </span>
                <Store size={16} className="mt-0.5 shrink-0 text-[#C1442D]" />
              </>
            )}
          </span>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-[#FBF7F2] px-3.5 py-2.5 text-center text-xs text-[#7A6F68]">
        Pay via DuitNow QR — we&apos;ll send it once your order is confirmed on
        WhatsApp.
      </p>

      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        <Button variant="outline" size="sm" onClick={onRetryWhatsApp}>
          <RotateCcw size={16} /> Didn&apos;t open? Try again
        </Button>
        <Button size="sm" onClick={onStartNewOrder}>
          Start a New Order
        </Button>
      </div>
    </div>
  );
}
