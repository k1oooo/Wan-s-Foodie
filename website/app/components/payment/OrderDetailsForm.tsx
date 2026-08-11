"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, MessageCircle } from "lucide-react";
import Button from "@/app/ui/Button";
import { useCart } from "@/lib/cart-context";
import { WHATSAPP_NUMBER } from "@/lib/site-config";
import {
  buildOrderMessage,
  formatRM,
  type DeliveryMethod,
} from "@/lib/order-utils";
import { submitOrder } from "@/lib/supabase/orders";
import type { ConfirmedOrder } from "./OrderInvoice";

interface OrderDetailsFormProps {
  /** Fired once the order is saved and the WhatsApp link is ready. The
   * parent (PaymentPageClient) owns the "is there a confirmed order" state
   * — this form doesn't keep its own copy, so there's no way for the page
   * header and the form body to disagree about whether an order was sent. */
  onOrderSent: (order: ConfirmedOrder, whatsAppHref: string) => void;
}

export default function OrderDetailsForm({
  onOrderSent,
}: OrderDetailsFormProps) {
  const { cart, totalPrice, totalBoxes } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("pickup");
  const [address, setAddress] = useState("");

  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    address: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);

  const hasItems = totalBoxes > 0;
  const nameError =
    customerName.trim().length === 0 ? "Please enter your name." : null;
  const phoneDigits = customerPhone.replace(/\D/g, "");
  const phoneError =
    phoneDigits.length < 9 ? "Please enter a valid phone number." : null;
  const addressError =
    deliveryMethod === "delivery" && address.trim().length === 0
      ? "Please enter your delivery address."
      : null;

  const isValid = hasItems && !nameError && !phoneError && !addressError;

  const showNameError = (touched.name || submitAttempted) && nameError;
  const showPhoneError = (touched.phone || submitAttempted) && phoneError;
  const showAddressError = (touched.address || submitAttempted) && addressError;

  async function handleSendOrder() {
    setSubmitAttempted(true);
    setSubmitError(null);

    if (!isValid) {
      if (nameError) {
        nameRef.current?.focus();
      } else if (phoneError) {
        phoneRef.current?.focus();
      } else if (addressError) {
        addressRef.current?.focus();
      }
      return;
    }

    // Open the tab synchronously, right here in the click handler, before
    // any `await`. Most mobile browsers only allow window.open() to
    // succeed within the direct, synchronous call stack of a user
    // gesture — calling it after an awaited network request routinely
    // gets silently blocked. We fill in the blank tab's URL once the
    // order is saved and we know the order number.
    const whatsAppWindow = window.open("", "_blank", "noopener,noreferrer");

    setIsSubmitting(true);
    try {
      const { orderNumber } = await submitOrder({
        cart,
        customerName,
        customerPhone,
        deliveryMethod,
        address,
      });

      const whatsAppHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        buildOrderMessage({
          cart,
          deliveryMethod,
          address,
          customerName,
          customerPhone,
          notes: "",
          orderNumber,
        }),
      )}`;

      if (whatsAppWindow) {
        whatsAppWindow.location.href = whatsAppHref;
      } else {
        // Popup was blocked outright (rare, but possible) — fall back to
        // a direct same-flow open; the invoice's "Try again" button uses
        // the same href if this also gets blocked.
        window.open(whatsAppHref, "_blank", "noopener,noreferrer");
      }

      onOrderSent(
        {
          orderNumber,
          items: Object.values(cart),
          total: totalPrice,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryMethod,
          address: address.trim(),
          sentAt: new Date().toISOString(),
        },
        whatsAppHref,
      );
    } catch (err) {
      whatsAppWindow?.close();
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong saving your order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-nunito text-lg font-extrabold tracking-[-0.04em] text-[#1F1A17] sm:text-xl">
        Order Details
      </h2>

      <div className="mt-3.5 space-y-3">
        <div>
          <label
            htmlFor="customer-name"
            className="font-nunito text-xs font-extrabold uppercase tracking-[0.1em] text-[#7A6F68]"
          >
            Full Name
          </label>
          <input
            ref={nameRef}
            id="customer-name"
            required
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            placeholder="e.g. Aisyah Rahman"
            aria-invalid={!!showNameError}
            aria-describedby={showNameError ? "customer-name-error" : undefined}
            className={`mt-1.5 w-full rounded-xl border-2 bg-white px-3.5 py-2.5 text-sm text-[#1F1A17] outline-none ${
              showNameError
                ? "border-red-400 focus:border-red-400"
                : "border-[#1F1A17]/15 focus:border-[#C1442D]"
            }`}
          />
          {showNameError && (
            <p id="customer-name-error" className="mt-1 text-xs text-red-500">
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="customer-phone"
            className="font-nunito text-xs font-extrabold uppercase tracking-[0.1em] text-[#7A6F68]"
          >
            Phone Number
          </label>
          <input
            ref={phoneRef}
            id="customer-phone"
            required
            type="tel"
            inputMode="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
            placeholder="e.g. 012-345 6789"
            aria-invalid={!!showPhoneError}
            aria-describedby={
              showPhoneError ? "customer-phone-error" : undefined
            }
            className={`mt-1.5 w-full rounded-xl border-2 bg-white px-3.5 py-2.5 text-sm text-[#1F1A17] outline-none ${
              showPhoneError
                ? "border-red-400 focus:border-red-400"
                : "border-[#1F1A17]/15 focus:border-[#C1442D]"
            }`}
          />
          {showPhoneError && (
            <p id="customer-phone-error" className="mt-1 text-xs text-red-500">
              {phoneError}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="font-nunito text-xs font-extrabold uppercase tracking-[0.1em] text-[#7A6F68]">
            Collection Method
          </legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setDeliveryMethod("pickup")}
              aria-pressed={deliveryMethod === "pickup"}
              className={`rounded-full border-2 px-4 py-2 font-nunito text-sm font-extrabold transition-colors ${
                deliveryMethod === "pickup"
                  ? "border-[#C1442D] bg-[#C1442D] text-[#FBF7F2]"
                  : "border-[#1F1A17]/15 text-[#1F1A17]"
              }`}
            >
              Pickup
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMethod("delivery")}
              aria-pressed={deliveryMethod === "delivery"}
              className={`rounded-full border-2 px-4 py-2 font-nunito text-sm font-extrabold transition-colors ${
                deliveryMethod === "delivery"
                  ? "border-[#C1442D] bg-[#C1442D] text-[#FBF7F2]"
                  : "border-[#1F1A17]/15 text-[#1F1A17]"
              }`}
            >
              Delivery
            </button>
          </div>
        </fieldset>

        {deliveryMethod === "delivery" && (
          <div>
            <label
              htmlFor="delivery-address"
              className="font-nunito text-xs font-extrabold uppercase tracking-[0.1em] text-[#7A6F68]"
            >
              Delivery Address
            </label>
            <textarea
              ref={addressRef}
              id="delivery-address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, address: true }))}
              rows={2}
              placeholder="Street, unit, city, postcode"
              aria-invalid={!!showAddressError}
              aria-describedby={
                showAddressError ? "delivery-address-error" : undefined
              }
              className={`mt-1.5 w-full rounded-xl border-2 bg-white px-3.5 py-2.5 text-sm text-[#1F1A17] outline-none ${
                showAddressError
                  ? "border-red-400 focus:border-red-400"
                  : "border-[#1F1A17]/15 focus:border-[#C1442D]"
              }`}
            />
            {showAddressError && (
              <p
                id="delivery-address-error"
                className="mt-1 text-xs text-red-500"
              >
                {addressError}
              </p>
            )}
            <p className="mt-1 text-xs text-[#7A6F68]">
              Delivery fee confirmed via WhatsApp based on your location.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1.5 border-t border-dashed border-[#1F1A17]/20 pt-3.5">
        <div className="flex items-center justify-between text-sm text-[#1F1A17]">
          <span>Subtotal</span>
          <span>{formatRM(totalPrice)}</span>
        </div>
        <div className="flex items-center justify-between font-nunito text-base font-extrabold text-[#1F1A17]">
          <span>Total</span>
          <span className="text-[#C1442D]">{formatRM(totalPrice)}</span>
        </div>
        <p className="pt-0.5 text-xs text-[#7A6F68]">
          Pay via DuitNow QR — sent once your order is confirmed.
        </p>
      </div>

      {!hasItems && (
        <p className="mt-3 text-center text-sm text-[#7A6F68]">
          Your cart is empty —{" "}
          <Link
            href="/order"
            className="font-extrabold text-[#C1442D] underline"
          >
            browse the menu
          </Link>{" "}
          to add items.
        </p>
      )}

      {submitError && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <Button
        onClick={handleSendOrder}
        disabled={!hasItems || isSubmitting}
        className="mt-4 w-full"
      >
        <MessageCircle size={20} />
        {isSubmitting ? "Sending..." : "Send Order"}
      </Button>
    </div>
  );
}
