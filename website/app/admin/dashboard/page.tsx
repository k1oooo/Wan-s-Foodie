import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import type { Order, RegularCustomer, MenuItem } from "../_lib/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [monthOrdersRes, recentOrdersRes, menuItemsRes, regularsRes] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .gte("created_at", startOfMonth.toISOString())
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("menu_items").select("*").order("sort_order"),
      supabase.from("regular_customers").select("*"),
    ]);

  // Supabase nests the join as `order_items` — rename to `items` to match our shared Order type.
  const monthOrders: Order[] = (monthOrdersRes.data ?? []).map((o) => ({
    ...o,
    items: o.order_items ?? [],
  }));
  const recentOrders: Order[] = (recentOrdersRes.data ?? []).map((o) => ({
    ...o,
    items: o.order_items ?? [],
  }));
  const menuItems: MenuItem[] = menuItemsRes.data ?? [];
  const regularCustomers: RegularCustomer[] = regularsRes.data ?? [];

  return (
    <DashboardClient
      monthOrders={monthOrders}
      recentOrders={recentOrders}
      menuItems={menuItems}
      regularCustomers={regularCustomers}
    />
  );
}
