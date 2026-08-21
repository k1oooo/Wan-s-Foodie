import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/supabase/settings";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return <SettingsClient initialSettings={settings} />;
}
