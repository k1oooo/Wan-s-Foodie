"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Users,
  ArrowUpRight,
  Phone,
  FileDown,
  Loader2,
} from "lucide-react";
import StatCard from "../_components/StatCard";
import {
  CATEGORY_STYLE,
  ORDER_STATUS_STYLE,
  PAYMENT_STATUS_STYLE,
} from "../_lib/category-style";
import type { Order, MenuItem, RegularCustomer, Category } from "../_lib/types";
import { toast } from "sonner";

interface DashboardClientProps {
  monthOrders: Order[];
  recentOrders: Order[];
  menuItems: MenuItem[];
  regularCustomers: RegularCustomer[];
}

function formatRM(amount: number) {
  return `RM ${amount.toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// "This month" = calendar month-to-date. Resets on the 1st, NOT a rolling 30-day window —
// matches the `date_trunc('month', created_at)` grouping used by the monthly_revenue view.
const monthLabel = new Date().toLocaleDateString("en-MY", {
  month: "long",
  year: "numeric",
});

export default function DashboardClient({
  monthOrders,
  recentOrders,
  menuItems,
  regularCustomers,
}: DashboardClientProps) {
  const [downloading, setDownloading] = useState(false);

  const paidOrders = monthOrders.filter((o) => o.payment_status === "paid");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingCount = monthOrders.filter((o) => o.status === "pending").length;

  const boxesByItem = new Map<
    string,
    { name: string; category: Category; boxes: number; revenue: number }
  >();
  paidOrders
    .flatMap((o) => o.items)
    .forEach((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
      const key = item.item_name;
      const current = boxesByItem.get(key) ?? {
        name: item.item_name,
        category: menuItem?.category ?? "chicken",
        boxes: 0,
        revenue: 0,
      };
      current.boxes += item.quantity_boxes;
      current.revenue += item.subtotal;
      boxesByItem.set(key, current);
    });
  const topItems = [...boxesByItem.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const lowStockItems = menuItems.filter((m) => m.stock_boxes <= 5);

  async function handleDownloadReport() {
    setDownloading(true);

    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Wan's Foodies — Sales Report", 14, 18);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Period: ${monthLabel}`, 14, 25);
      doc.text(`Generated: ${new Date().toLocaleString("en-MY")}`, 14, 30);

      autoTable(doc, {
        startY: 38,
        head: [["Metric", "Value"]],
        body: [
          ["Revenue (paid orders)", formatRM(totalRevenue)],
          ["Total orders", String(monthOrders.length)],
          ["Pending orders", String(pendingCount)],
          ["Regular customers (lifetime)", String(regularCustomers.length)],
        ],
        theme: "grid",
        headStyles: { fillColor: [15, 23, 42] },
      });

      // ... rest of your PDF generation

      const filename = `wans-foodies-sales-report-${new Date()
        .toISOString()
        .slice(0, 7)}.pdf`;

      doc.save(filename);

      toast.success("Sales report downloaded successfully");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleDownloadReport}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          Download sales report (PDF)
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (paid orders)"
          value={formatRM(totalRevenue)}
          icon={DollarSign}
          hint={monthLabel}
        />
        <StatCard
          label="Total orders"
          value={String(monthOrders.length)}
          icon={ShoppingBag}
          hint={monthLabel}
        />
        <StatCard
          label="Pending orders"
          value={String(pendingCount)}
          icon={Clock}
          hint="Need confirmation"
          tone={pendingCount > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Regular customers"
          value={String(regularCustomers.length)}
          icon={Users}
          hint="Lifetime, 2+ paid orders"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Top selling items */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Top selling items
            </h2>
            <span className="text-xs text-slate-400">{monthLabel}</span>
          </div>
          {topItems.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No paid orders yet this month.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topItems.map((item) => {
                const style = CATEGORY_STYLE[item.category];
                const maxRevenue = topItems[0].revenue || 1;
                return (
                  <li key={item.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                        {item.name}
                      </span>
                      <span className="tabular-nums text-slate-500">
                        {item.boxes} boxes &middot; {formatRM(item.revenue)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-1.5 rounded-full ${style.dot}`}
                        style={{
                          width: `${Math.max(6, (item.revenue / maxRevenue) * 100)}%`,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Low stock alert */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">Low stock</h2>
          {lowStockItems.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              All items are well stocked.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {lowStockItems.map((item) => {
                const style = CATEGORY_STYLE[item.category];
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 text-slate-800">
                      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                      {item.name}
                    </span>
                    <span
                      className={`font-medium tabular-nums ${item.stock_boxes === 0 ? "text-red-600" : "text-amber-600"}`}
                    >
                      {item.stock_boxes} left
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href="/admin/menu"
            className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            Manage stock <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5 sm:px-5">Order</th>
                <th className="px-4 py-2.5 sm:px-5">Customer</th>
                <th className="px-4 py-2.5 sm:px-5">Status</th>
                <th className="px-4 py-2.5 sm:px-5">Payment</th>
                <th className="px-4 py-2.5 text-right sm:px-5">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-400 sm:px-5"
                  >
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 sm:px-5">
                      {order.order_number}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 sm:px-5">
                      {order.customer_name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLE[order.status].badge}`}
                      >
                        {ORDER_STATUS_STYLE[order.status].label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_STYLE[order.payment_status].badge}`}
                      >
                        {PAYMENT_STATUS_STYLE[order.payment_status].label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-900 sm:px-5">
                      {formatRM(order.total_amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regular customers */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Regular customers
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Customers with more than one paid order, all time
          </p>
        </div>
        {regularCustomers.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            No repeat customers yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5 sm:px-5">Customer</th>
                  <th className="px-4 py-2.5 sm:px-5">Paid orders</th>
                  <th className="px-4 py-2.5 sm:px-5">Lifetime spend</th>
                  <th className="px-4 py-2.5 sm:px-5">Last order</th>
                </tr>
              </thead>
              <tbody>
                {regularCustomers
                  .slice()
                  .sort((a, b) => b.lifetime_spend - a.lifetime_spend)
                  .map((c) => (
                    <tr
                      key={c.customer_phone}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="px-4 py-3 sm:px-5">
                        <p className="font-medium text-slate-900">
                          {c.customer_name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="h-3 w-3" /> {c.customer_phone}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-700 sm:px-5">
                        {c.total_orders}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-slate-900 sm:px-5">
                        {formatRM(c.lifetime_spend)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500 sm:px-5">
                        {formatDate(c.last_order_at)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
