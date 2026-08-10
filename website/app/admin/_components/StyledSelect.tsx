"use client";

import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

interface StyledSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "className"
> {
  /** Optional dot color (Tailwind bg-* class) shown before the value. */
  dotClassName?: string;
}

/**
 * A native <select> restyled to match the admin panel's design language
 * instead of the browser default — flat rounded field, custom chevron,
 * consistent focus ring. Stays a real <select> for accessibility/mobile
 * keyboard support; only the chrome is replaced.
 */
export default function StyledSelect({
  dotClassName,
  disabled,
  children,
  ...rest
}: StyledSelectProps) {
  return (
    <div className="relative">
      {dotClassName && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${dotClassName}`}
        />
      )}

      <select
        disabled={disabled}
        className={`w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${
          dotClassName ? "pl-7" : "pl-2.5"
        }`}
        {...rest}
      >
        {children}
      </select>

      <ChevronDown
        className={`pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
          disabled ? "text-slate-300" : "text-slate-400"
        }`}
      />
    </div>
  );
}
