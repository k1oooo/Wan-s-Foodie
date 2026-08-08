import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "./_components/AdminShell";
import "./admin.css";

// Admin uses its own professional, neutral type system —
// intentionally not the customer site's Nunito/Supreme pairing.
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "Admin | Wan's Foodies",
    template: "%s | Wan's Foodies Admin",
  },
  description: "Internal admin dashboard for managing Wan's Foodies orders and menu.",
  robots: { index: false, follow: false }, // admin pages should never be indexed
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className={`admin-root ${inter.variable} ${jetbrainsMono.variable}`}>
      <AdminShell userEmail={user?.email}>{children}</AdminShell>
      <Toaster richColors position="top-right" toastOptions={{ className: "!font-sans" }} />
    </div>
  );
}
