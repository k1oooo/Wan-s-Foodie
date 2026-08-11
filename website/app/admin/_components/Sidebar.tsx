"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  UserCog,
  X,
  CookingPot,
  FileDown,
  Loader2,
} from "lucide-react";
import SignOutButton from "./SignOutButton";
import { generateSalesReportPdf } from "../_lib/sales-report";
import { toast } from "sonner";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/users", label: "Users", icon: UserCog },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string | null;
}

export default function Sidebar({ open, onClose, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadReport() {
    setDownloading(true);
    try {
      await generateSalesReportPdf();
      toast.success("Sales report downloaded successfully");
    } catch {
      toast.error("Couldn't generate the report. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <CookingPot className="h-4.5 w-4.5 text-white" strokeWidth={2} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">
                Wan&apos;s Foodies
              </p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <FileDown className="h-4.5 w-4.5" strokeWidth={2} />
            )}
            {downloading ? "Generating..." : "Download sales report"}
          </button>

          {userEmail && (
            <p className="truncate px-3 pb-1 text-xs text-slate-400">
              {userEmail}
            </p>
          )}
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
