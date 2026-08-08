"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/admin/dashboard": { title: "Dashboard", subtitle: "Sales overview and performance" },
  "/admin/orders": { title: "Orders", subtitle: "Manage incoming orders and status" },
  "/admin/menu": { title: "Menu", subtitle: "Manage items, pricing and stock" },
};

interface AdminShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
}

export default function AdminShell({ children, userEmail }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname() ?? "";

  // The login page renders its own full-screen layout — no sidebar/topbar.
  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  const meta = PAGE_META[pathname] ?? { title: "Admin", subtitle: "" };

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} userEmail={userEmail} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={meta.title} subtitle={meta.subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
