"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, ChevronDown, MapPin, Store, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus, PaymentStatus } from "../_lib/types";
import { ORDER_STATUS_STYLE, PAYMENT_STATUS_STYLE, ORDER_STATUS_FLOW } from "../_lib/category-style";

function formatRM(amount: number) {
  return `RM ${amount.toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-MY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

const STATUS_FILTERS: (OrderStatus | "all")[] = ["all", ...ORDER_STATUS_FLOW];

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return orders
      .filter((o) => statusFilter === "all" || o.status === statusFilter)
      .filter((o) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, query, statusFilter]);

  async function updateStatus(id: string, status: OrderStatus) {
    setSavingId(id);
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);

    setSavingId(null);
    if (error) {
      setOrders(previous); // revert on failure
      toast.error("Couldn't update status", { description: "Please try again." });
    } else {
      toast.success(`Order ${previous.find((o) => o.id === id)?.order_number ?? ""} marked ${ORDER_STATUS_STYLE[status].label.toLowerCase()}`);
      router.refresh(); // resync server data (e.g. dashboard stats elsewhere)
    }
  }

  async function updatePayment(id: string, payment_status: PaymentStatus) {
    setSavingId(id);
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, payment_status } : o)));

    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ payment_status }).eq("id", id);

    setSavingId(null);
    if (error) {
      setOrders(previous);
      toast.error("Couldn't update payment status", { description: "Please try again." });
    } else {
      toast.success(`Payment marked ${PAYMENT_STATUS_STYLE[payment_status].label.toLowerCase()}`);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, name, or phone"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {s === "all" ? "All" : ORDER_STATUS_STYLE[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No orders match your filters.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((order) => {
              const isOpen = expandedId === order.id;
              return (
                <li key={order.id}>
                  <button
                    onClick={() => setExpandedId(isOpen ? null : order.id)}
                    className="flex w-full flex-col gap-2 px-4 py-3.5 text-left hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                  >
                    <div className="flex items-center gap-2 sm:w-32 sm:shrink-0">
                      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      <span className="font-medium text-slate-900">{order.order_number}</span>
                    </div>
                    <div className="sm:w-44 sm:shrink-0">
                      <p className="text-sm text-slate-800">{order.customer_name}</p>
                      <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:flex-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLE[order.status].badge}`}>
                        {ORDER_STATUS_STYLE[order.status].label}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_STYLE[order.payment_status].badge}`}>
                        {PAYMENT_STATUS_STYLE[order.payment_status].label}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                        {order.collection_type}
                      </span>
                    </div>
                    <div className="text-right sm:w-24 sm:shrink-0">
                      <span className="font-medium tabular-nums text-slate-900">{formatRM(order.total_amount)}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 sm:px-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Line items */}
                        <div className="md:col-span-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Items</p>
                          <ul className="mt-2 space-y-1.5">
                            {order.items.map((item) => (
                              <li key={item.id} className="flex items-center justify-between text-sm text-slate-700">
                                <span>{item.quantity_boxes} &times; {item.item_name}</span>
                                <span className="tabular-nums">{formatRM(item.subtotal)}</span>
                              </li>
                            ))}
                          </ul>
                          {order.notes && (
                            <p className="mt-3 rounded-lg bg-white p-2.5 text-xs text-slate-600 ring-1 ring-inset ring-slate-200">
                              Note: {order.notes}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="h-3.5 w-3.5" /> {order.customer_phone}
                          </div>
                          <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
                            {order.collection_type === "delivery" ? (
                              <>
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {order.delivery_address}
                              </>
                            ) : (
                              <>
                                <Store className="h-3.5 w-3.5" /> Self pickup
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Order status</label>
                            <select
                              value={order.status}
                              disabled={savingId === order.id}
                              onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
                            >
                              {ORDER_STATUS_FLOW.map((s) => (
                                <option key={s} value={s}>
                                  {ORDER_STATUS_STYLE[s].label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Payment</label>
                            <select
                              value={order.payment_status}
                              disabled={savingId === order.id}
                              onChange={(e) => updatePayment(order.id, e.target.value as PaymentStatus)}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
