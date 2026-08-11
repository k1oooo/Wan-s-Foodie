"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import CartSheet from "./CartSheet";

const NAV_LINKS = [
  { label: "Menu", href: "/#menu" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function OrderFlowNavbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const { totalBoxes } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 sm:px-6">
      <nav
        aria-label="Primary"
        className="mx-auto flex w-full max-w-[1240px] items-center justify-between rounded-[40px] border-2 border-[#C1442D] bg-[#FBF7F2] px-5 py-2.5 sm:px-8"
      >
        <Link
          href="/"
          className="shrink-0 font-nunito text-xl font-extrabold tracking-[-0.06em] sm:text-2xl"
        >
          <span className="text-[#E3A73B]">Wan&apos;s</span>{" "}
          <span className="text-[#C1442D]">Foodies</span>
        </Link>

        {/* Desktop: logo + links, no cart icon (the order page already
            shows the cart inline on desktop). */}
        <ul className="hidden items-center gap-10 font-nunito text-lg font-extrabold tracking-[-0.06em] text-[#1F1A17] md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="transition-colors hover:text-[#C1442D]"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile: cart icon only — this is the sole way to view the order
            summary on mobile now. */}
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          aria-label={
            totalBoxes > 0
              ? `View your order — ${totalBoxes} box${totalBoxes === 1 ? "" : "es"}`
              : "View your order"
          }
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#C1442D] md:hidden"
        >
          <ShoppingBag size={24} />
          {totalBoxes > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#C1442D] px-1 font-nunito text-[10px] font-extrabold text-[#FBF7F2]">
              {totalBoxes}
            </span>
          )}
        </button>
      </nav>

      {cartOpen && <CartSheet onClose={() => setCartOpen(false)} />}
    </header>
  );
}
