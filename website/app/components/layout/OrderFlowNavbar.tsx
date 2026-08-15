"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import CartSheet from "./CartSheet";

const NAV_LINKS = [
  { label: "Menu", href: "/#menu" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function OrderFlowNavbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { totalBoxes } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-3 sm:px-6">
      {/* relative wrapper: the dropdown below is positioned against this,
          not against the header, so it can overlay page content instead of
          adding to the header's own (reserved) height */}
      <div className="relative mx-auto w-full max-w-[1240px]">
        <nav
          aria-label="Primary"
          className={`flex w-full items-center justify-between border-2 border-[#C1442D] bg-[#FBF7F2] px-5 py-2.5 sm:px-8 ${
            isOpen
              ? "rounded-t-[32px] rounded-b-none border-b-0"
              : "rounded-[40px]"
          }`}
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

          {/* Mobile: cart icon while there's something to view, otherwise a
              hamburger for the nav links — an empty cart icon isn't useful,
              so it's replaced rather than shown disabled or badge-less. */}
          {totalBoxes > 0 ? (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`View your order — ${totalBoxes} box${totalBoxes === 1 ? "" : "es"}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#C1442D] md:hidden"
            >
              <ShoppingBag size={24} />
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#C1442D] px-1 font-nunito text-[10px] font-extrabold text-[#FBF7F2]">
                {totalBoxes}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-controls="order-flow-mobile-nav"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#C1442D] md:hidden"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </nav>

        {/* Mobile nav panel — only reachable via the hamburger, i.e. only
            when the cart is empty. Absolutely positioned so it overlays the
            page below (instead of pushing content down), while the shared
            border/matching radius make it read as one continuous container
            with the nav bar above rather than a second floating box. */}
        {isOpen && (
          <div
            id="order-flow-mobile-nav"
            className="absolute inset-x-0 top-full z-40 flex flex-col gap-1 rounded-b-[32px] border-2 border-t-0 border-[#C1442D] bg-[#FBF7F2] p-5 font-nunito text-lg font-extrabold text-[#1F1A17] md:hidden"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-3 py-3 transition-colors hover:bg-[#FBF7F2] hover:text-[#C1442D]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {cartOpen && <CartSheet onClose={() => setCartOpen(false)} />}
    </header>
  );
}
