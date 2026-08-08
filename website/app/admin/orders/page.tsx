import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import OrdersClient from "./OrdersClient";
import type { Order } from "../_lib/types";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  const orders: Order[] = (data ?? []).map((o) => ({
    ...o,
    items: o.order_items ?? [],
  }));

  return <OrdersClient initialOrders={orders} />;
}
