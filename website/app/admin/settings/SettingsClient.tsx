"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Package,
  AlertTriangle,
  CalendarRange,
  Loader2,
  Info,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { SiteSettings } from "../_lib/types";

type Draft = Omit<SiteSettings, "id" | "updated_at">;

function toDraft(settings: SiteSettings): Draft {
  return {
    business_email: settings.business_email,
    contact_phone: settings.contact_phone,
    pickup_address: settings.pickup_address,
    preorder_minimum_boxes: settings.preorder_minimum_boxes,
    low_stock_threshold: settings.low_stock_threshold,
    monthly_order_limit_boxes: settings.monthly_order_limit_boxes,
  };
}

export default function SettingsClient({
  initialSettings,
}: {
  initialSettings: SiteSettings;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSettings);
  const [draft, setDraft] = useState<Draft>(toDraft(initialSettings));
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(toDraft(saved)),
    [draft, saved],
  );

  const phoneDigits = draft.contact_phone.replace(/\D/g, "");
  const phoneError =
    phoneDigits.length > 0 && phoneDigits !== draft.contact_phone
      ? "Digits only — no +, spaces, or dashes (e.g. 601154043689)."
      : null;

  const preorderInvalid = draft.preorder_minimum_boxes < 1;
  const lowStockInvalid = draft.low_stock_threshold < 0;
  const monthlyLimitInvalid = draft.monthly_order_limit_boxes < 1;

  const hasErrors =
    !!phoneError || preorderInvalid || lowStockInvalid || monthlyLimitInvalid;

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (hasErrors || !isDirty) return;

    setSaving(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("site_settings")
      .update(draft)
      .eq("id", 1)
      .select()
      .single();

    setSaving(false);

    if (error || !data) {
      toast.error("Couldn't save settings. Please try again.");
      return;
    }

    setSaved(data as SiteSettings);
    setDraft(toDraft(data as SiteSettings));
    toast.success("Settings saved");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-4 pb-20">
      {/* Business Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Mail className="h-4.5 w-4.5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">
            Business information
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Shown to customers on the site and used for the WhatsApp order
          flow.
        </p>

        <div className="mt-3.5 space-y-3.5">
          <div>
            <label
              htmlFor="business-email"
              className="text-xs font-medium text-slate-600"
            >
              Business email
            </label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="business-email"
                type="email"
                value={draft.business_email}
                onChange={(e) => update("business_email", e.target.value)}
                placeholder="hello@wansfoodies.com"
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-phone"
              className="text-xs font-medium text-slate-600"
            >
              WhatsApp / contact number
            </label>
            <div className="relative mt-1">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="contact-phone"
                type="tel"
                inputMode="tel"
                value={draft.contact_phone}
                onChange={(e) => update("contact_phone", e.target.value)}
                aria-invalid={!!phoneError}
                placeholder="601154043689"
                className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 ${
                  phoneError
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
                }`}
              />
            </div>
            {phoneError ? (
              <p className="mt-1 text-xs text-red-500">{phoneError}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                Country code, no + or spaces — this is what customers&apos;
                WhatsApp orders and homepage &quot;Chat on WhatsApp&quot; link
                use.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="pickup-address"
              className="text-xs font-medium text-slate-600"
            >
              Pickup address
            </label>
            <div className="relative mt-1">
              <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <textarea
                id="pickup-address"
                rows={2}
                value={draft.pickup_address}
                onChange={(e) => update("pickup_address", e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Shown on the checkout page, the order receipt, and Google Maps
              directions.
            </p>
          </div>
        </div>
      </div>

      {/* Product / Order Settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Package className="h-4.5 w-4.5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">
            Product &amp; order settings
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Thresholds used across the menu, stock, and ordering flow.
        </p>

        <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="preorder-minimum"
              className="text-xs font-medium text-slate-600"
            >
              Pre-order minimum (boxes)
            </label>
            <input
              id="preorder-minimum"
              type="number"
              min={1}
              value={draft.preorder_minimum_boxes}
              onChange={(e) =>
                update("preorder_minimum_boxes", Number(e.target.value))
              }
              aria-invalid={preorderInvalid}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                preorderInvalid
                  ? "border-red-300 focus:ring-red-100"
                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
              }`}
            />
            {preorderInvalid && (
              <p className="mt-1 text-xs text-red-500">Must be at least 1.</p>
            )}
          </div>

          <div>
            <label
              htmlFor="low-stock"
              className="text-xs font-medium text-slate-600"
            >
              Low-stock threshold (boxes)
            </label>
            <input
              id="low-stock"
              type="number"
              min={0}
              value={draft.low_stock_threshold}
              onChange={(e) =>
                update("low_stock_threshold", Number(e.target.value))
              }
              aria-invalid={lowStockInvalid}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                lowStockInvalid
                  ? "border-red-300 focus:ring-red-100"
                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
              }`}
            />
            {lowStockInvalid && (
              <p className="mt-1 text-xs text-red-500">
                Can&apos;t be negative.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="monthly-limit"
              className="text-xs font-medium text-slate-600"
            >
              Max order per month (boxes)
            </label>
            <input
              id="monthly-limit"
              type="number"
              min={1}
              value={draft.monthly_order_limit_boxes}
              onChange={(e) =>
                update("monthly_order_limit_boxes", Number(e.target.value))
              }
              aria-invalid={monthlyLimitInvalid}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                monthlyLimitInvalid
                  ? "border-red-300 focus:ring-red-100"
                  : "border-slate-200 focus:border-slate-400 focus:ring-slate-200"
              }`}
            />
            {monthlyLimitInvalid && (
              <p className="mt-1 text-xs text-red-500">Must be at least 1.</p>
            )}
          </div>
        </div>

        <div className="mt-3.5 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>
            &quot;Low-stock threshold&quot; is when an item is flagged as
            running low. Once stock hits 0, it automatically switches to
            &quot;Pre-order&quot; with the minimum above.
          </span>
        </div>

        <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
          <CalendarRange className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>
            Once the monthly limit is reached, new orders automatically move
            into next month&apos;s queue.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-500">
        <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        Changes apply immediately across the site — no redeploy needed.
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          onClick={handleSave}
          disabled={!isDirty || hasErrors || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving..." : isDirty ? "Save changes" : "Saved"}
        </button>
      </div>
    </div>
  );
}
