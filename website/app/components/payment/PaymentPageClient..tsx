"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import CartItemsCard from "./CartItemsCard";
import OrderDetailsForm from "./OrderDetailsForm";
import OrderInvoice, { type ConfirmedOrder } from "./OrderInvoice";

interface PaymentPageClientProps {
  whatsappNumber: string;
  pickupAddress: string;
}

export default function PaymentPageClient({
  whatsappNumber,
  pickupAddress,
}: PaymentPageClientProps) {
  const router = useRouter();
  const { clearCart } = useCart();

  // Single source of truth for "has an order been sent" — both the page
  // heading and which body to render (form vs invoice) derive from this
  // one value, so they can never disagree with each other.
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(
    null,
  );
  const [whatsAppHref, setWhatsAppHref] = useState<string | null>(null);

  function handleOrderSent(order: ConfirmedOrder, href: string) {
    // The order snapshot (order.items) already captured the cart's contents
    // before this fires, so it's safe to clear the live cart here. Doing it
    // immediately — rather than waiting for "Start New Order" — is what
    // makes the mobile navbar's cart icon disappear right after sending,
    // since that icon is only shown while totalBoxes > 0.
    setConfirmedOrder(order);
    setWhatsAppHref(href);
    clearCart();
  }

  function handleRetryWhatsApp() {
    if (whatsAppHref) {
      window.open(whatsAppHref, "_blank", "noopener,noreferrer");
    }
  }

  function handleStartNewOrder() {
    clearCart();
    setConfirmedOrder(null);
    setWhatsAppHref(null);
    router.push("/order");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col px-6 py-6 sm:px-10 lg:h-full lg:py-6">
      <h1 className="shrink-0 text-center font-nunito text-2xl font-extrabold tracking-[-0.06em] text-[#1F1A17] sm:text-3xl">
        {confirmedOrder ? "Order Confirmation" : "Order Information"}
      </h1>

      {confirmedOrder ? (
        // Once the order is sent, the cart is no longer relevant — show
        // just the invoice, centered, instead of the two-column layout.
        <div className="mx-auto mt-5 w-full max-w-md lg:overflow-y-auto">
          <OrderInvoice
            order={confirmedOrder}
            pickupAddress={pickupAddress}
            onRetryWhatsApp={handleRetryWhatsApp}
            onStartNewOrder={handleStartNewOrder}
          />
        </div>
      ) : (
        // Each column scrolls independently as a safety net — the goal is that
        // neither column needs to scroll on a normal screen, but if the cart
        // has many items or a validation message appears, that column scrolls
        // on its own instead of pushing the Send Order button off-screen.
        <div className="mt-5 grid flex-1 grid-cols-1 gap-6 lg:min-h-0 lg:grid-cols-[1fr_380px] lg:gap-8">
          <div className="lg:min-h-0 lg:overflow-y-auto lg:pr-2">
            <CartItemsCard />
          </div>
          <div className="lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            <OrderDetailsForm
              onOrderSent={handleOrderSent}
              whatsappNumber={whatsappNumber}
              pickupAddress={pickupAddress}
            />
          </div>
        </div>
      )}
    </div>
  );
}
