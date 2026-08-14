"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  MapPin,
  Store,
  Phone,
  Lock,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus, PaymentStatus } from "../_lib/types";
import {
  ORDER_STATUS_STYLE,
  PAYMENT_STATUS_STYLE,
  ORDER_STATUS_FLOW,
} from "../_lib/category-style";
import {
  getLockState,
  isLockableStatus,
  formatRemaining,
} from "../_lib/order-lock";
import ConfirmDialog from "../_components/ConfirmDialog";
import StyledSelect from "../_components/StyledSelect";
import { toast } from "sonner";

function formatRM(amount: number) {
  return `RM ${amount.toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_FILTERS: (OrderStatus | "all")[] = ["all", ...ORDER_STATUS_FLOW];

const ORDER_STATUS_DOT: Record<OrderStatus, string> = {
  pending: "bg-slate-400",
  confirmed: "bg-indigo-500",
  preparing: "bg-amber-500",
  ready: "bg-sky-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
  refunded: "bg-purple-500",
};

interface PendingStatusChange {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
}

export default function OrdersClient({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingChange, setPendingChange] =
    useState<PendingStatusChange | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Ticks every 30s so lock countdowns stay live without a full refetch.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

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
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [orders, query, statusFilter]);

  async function applyStatusChange(id: string, status: OrderStatus) {
    setSavingId(id);

    const previous = orders;
    // Finalizing (completed/cancelled/refunded) starts the 24h lock
    // countdown; moving to any other status clears it.
    const statusFinalizedAt = isLockableStatus(status)
      ? new Date().toISOString()
      : null;
    // A refunded order can't still be "paid" — money went back to the
    // customer, so payment status follows the order status automatically.
    const paymentStatusUpdate =
      status === "refunded" ? { payment_status: "refunded" as const } : {};

    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              status_finalized_at: statusFinalizedAt,
              ...paymentStatusUpdate,
            }
          : o,
      ),
    );

    const order = orders.find((o) => o.id === id);

    const supabase = createClient();

    const { error } = await supabase
      .from("orders")
      .update({
        status,
        status_finalized_at: statusFinalizedAt,
        ...paymentStatusUpdate,
      })
      .eq("id", id);

    setSavingId(null);

    if (error) {
      setOrders(previous);
      toast.error("Couldn't update order status. Please try again.");
    } else {
      toast.success(
        `Order ${order?.order_number ?? ""} status updated to ${
          ORDER_STATUS_STYLE[status].label
        }`,
      );
      router.refresh();
    }
  }

  function handleStatusSelect(order: Order, status: OrderStatus) {
    if (status === order.status) return;

    if (isLockableStatus(status)) {
      setPendingChange({
        orderId: order.id,
        orderNumber: order.order_number,
        status,
      });
      return;
    }

    applyStatusChange(order.id, status);
  }

  async function confirmPendingChange() {
    if (!pendingChange) return;
    setConfirming(true);
    await applyStatusChange(pendingChange.orderId, pendingChange.status);
    setConfirming(false);
    setPendingChange(null);
  }

  async function updatePayment(id: string, payment_status: PaymentStatus) {
    setSavingId(id);

    const previous = orders;

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, payment_status } : o)),
    );

    const order = orders.find((o) => o.id === id);

    const supabase = createClient();

    const { error } = await supabase
      .from("orders")
      .update({ payment_status })
      .eq("id", id);

    setSavingId(null);

    if (error) {
      setOrders(previous);

      toast.error("Couldn't update payment status. Please try again.");
    } else {
      toast.success(
        `Order ${order?.order_number ?? ""} payment marked as ${
          payment_status === "paid" ? "paid" : "unpaid"
        }`,
      );

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
          <p className="p-8 text-center text-sm text-slate-500">
            No orders match your filters.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((order) => {
              const isOpen = expandedId === order.id;
              const lock = getLockState(order.status_finalized_at, now);

              return (
                <li key={order.id}>
                  <button
                    onClick={() => setExpandedId(isOpen ? null : order.id)}
                    className="flex w-full flex-col gap-2 px-4 py-3.5 text-left hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                  >
                    <div className="flex items-center gap-2 sm:w-32 sm:shrink-0">
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />

                      <span className="font-medium text-slate-900">
                        {order.order_number}
                      </span>
                    </div>

                    <div className="sm:w-44 sm:shrink-0">
                      <p className="text-sm text-slate-800">
                        {order.customer_name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:flex-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLE[order.status].badge}`}
                      >
                        {ORDER_STATUS_STYLE[order.status].label}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_STYLE[order.payment_status].badge}`}
                      >
                        {PAYMENT_STATUS_STYLE[order.payment_status].label}
                      </span>

                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                        {order.collection_type}
                      </span>

                      {lock.isLocked && (
                        <span className="flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-white">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      )}
                      {lock.isCountingDown && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                          <Clock className="h-3 w-3" />
                          Locks in {formatRemaining(lock.msRemaining)}
                        </span>
                      )}
                    </div>

                    <div className="text-right sm:w-24 sm:shrink-0">
                      <span className="font-medium tabular-nums text-slate-900">
                        {formatRM(order.total_amount)}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 sm:px-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Line items */}
                        <div className="md:col-span-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Items
                          </p>

                          <ul className="mt-2 space-y-1.5">
                            {order.items.map((item) => (
                              <li
                                key={item.id}
                                className="flex items-center justify-between text-sm text-slate-700"
                              >
                                <span>
                                  {item.quantity_boxes} &times; {item.item_name}
                                </span>

                                <span className="tabular-nums">
                                  {formatRM(item.subtotal)}
                                </span>
                              </li>
                            ))}
                          </ul>

                          {order.notes && (
                            <p className="mt-3 rounded-lg bg-white p-2.5 text-xs text-slate-600 ring-1 ring-inset ring-slate-200">
                              Note: {order.notes}
                            </p>
                          )}

                          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone className="h-3.5 w-3.5" />
                            {order.customer_phone}
                          </div>

                          <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
                            {order.collection_type === "delivery" ? (
                              <>
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                {order.delivery_address}
                              </>
                            ) : (
                              <>
                                <Store className="h-3.5 w-3.5" />
                                Self pickup
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                          {lock.isLocked ? (
                            <div className="rounded-lg border border-slate-200 bg-white p-3">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                <Lock className="h-4 w-4 text-slate-400" />
                                Order locked
                              </div>
                              <p className="mt-1 text-xs text-slate-500">
                                This order was{" "}
                                {ORDER_STATUS_STYLE[
                                  order.status
                                ].label.toLowerCase()}{" "}
                                more than 24 hours ago and can no longer be
                                edited.
                              </p>
                            </div>
                          ) : (
                            <>
                              <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Order status
                                </label>

                                <div className="mt-1">
                                  <StyledSelect
                                    value={order.status}
                                    disabled={savingId === order.id}
                                    dotClassName={
                                      ORDER_STATUS_DOT[order.status]
                                    }
                                    onChange={(e) =>
                                      handleStatusSelect(
                                        order,
                                        e.target.value as OrderStatus,
                                      )
                                    }
                                  >
                                    {ORDER_STATUS_FLOW.map((s) => (
                                      <option key={s} value={s}>
                                        {ORDER_STATUS_STYLE[s].label}
                                      </option>
                                    ))}
                                  </StyledSelect>
                                </div>

                                {lock.isCountingDown && (
                                  <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-600">
                                    <Clock className="h-3 w-3" />
                                    Locks in {formatRemaining(lock.msRemaining)}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                  Payment
                                </label>

                                <div className="mt-1">
                                  <StyledSelect
                                    value={order.payment_status}
                                    disabled={
                                      savingId === order.id ||
                                      order.status === "refunded"
                                    }
                                    dotClassName={
                                      order.payment_status === "paid"
                                        ? "bg-emerald-500"
                                        : order.payment_status === "refunded"
                                          ? "bg-purple-500"
                                          : "bg-red-500"
                                    }
                                    onChange={(e) =>
                                      updatePayment(
                                        order.id,
                                        e.target.value as PaymentStatus,
                                      )
                                    }
                                  >
                                    <option value="unpaid">Unpaid</option>
                                    <option value="paid">Paid</option>
                                    {order.payment_status === "refunded" && (
                                      <option value="refunded">Refunded</option>
                                    )}
                                  </StyledSelect>
                                </div>

                                {order.status === "refunded" && (
                                  <p className="mt-1.5 text-xs text-slate-500">
                                    Payment status is locked once an order is
                                    refunded.
                                  </p>
                                )}
                              </div>
                            </>
                          )}
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

      {pendingChange && (
        <ConfirmDialog
          title={`Mark order ${pendingChange.orderNumber} as ${ORDER_STATUS_STYLE[pendingChange.status].label}?`}
          description={
            <>
              You&apos;ll have <strong>24 hours</strong> to make further changes
              to this order. After that, it will be locked and can no longer be
              edited.
            </>
          }
          confirmLabel={`Yes, mark as ${ORDER_STATUS_STYLE[pendingChange.status].label}`}
          tone={
            pendingChange.status === "cancelled" ||
            pendingChange.status === "refunded"
              ? "danger"
              : "default"
          }
          isSubmitting={confirming}
          onCancel={() => setPendingChange(null)}
          onConfirm={confirmPendingChange}
        />
      )}
    </div>
  );
}
