import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import MenuClient from "./MenuClient";
import type { MenuItem } from "../_lib/types";

export const metadata: Metadata = { title: "Menu" };

export default async function MenuPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order");
  const items: MenuItem[] = data ?? [];

  return <MenuClient initialItems={items} />;
}
