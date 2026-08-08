"use client";

import { Menu } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export default function Topbar({ title, subtitle, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6">
      <button
        aria-label="Open menu"
        onClick={onMenuClick}
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs text-slate-500 sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
