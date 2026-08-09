"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Button from "@/app/ui/Button";

const NAV_LINKS = [
  { label: "Menu", href: "/#menu" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full  px-4 pt-3 sm:px-6">
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

        {/* Desktop nav */}
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

        <Button href="/order" className="hidden shrink-0 md:inline-flex">
          Order Now
        </Button>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#C1442D] md:hidden"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile nav panel */}
      {isOpen && (
        <div
          id="mobile-nav"
          className="mx-auto mt-2 flex w-full max-w-[1240px] flex-col gap-1 rounded-[32px] border-2 border-[#C1442D] bg-[#FBF7F2] p-5 font-nunito text-lg font-extrabold text-[#1F1A17] md:hidden"
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
          <Button
            href="/order"
            onClick={() => setIsOpen(false)}
            className="mt-2 w-full"
          >
            Order Now
          </Button>
        </div>
      )}
    </header>
  );
}
