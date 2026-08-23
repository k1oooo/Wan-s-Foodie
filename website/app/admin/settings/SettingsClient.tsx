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
  Truck,
  Plus,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { SiteSettings } from "../_lib/types";
import type { DeliveryFeeTier } from "@/lib/delivery/fee-tiers";

type Draft = Omit<SiteSettings, "id" | "updated_at">;

function toDraft(settings: SiteSettings): Draft {
  return {
    business_email: settings.business_email,
    contact_phone: settings.contact_phone,
    pickup_address: settings.pickup_address,
    preorder_minimum_boxes: settings.preorder_minimum_boxes,
    low_stock_threshold: settings.low_stock_threshold,
    monthly_order_limit_boxes: settings.monthly_order_limit_boxes,
    delivery_fee_tiers: settings.delivery_fee_tiers,
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

  const tierErrors = useMemo(() => {
    const errors: string[] = [];
    if (draft.delivery_fee_tiers.length === 0) {
      errors.push("Add at least one tier.");
      return errors;
    }
    if (draft.delivery_fee_tiers.some((t) => !(t.maxKm > 0))) {
      errors.push("Distance must be greater than 0km.");
    }
    if (draft.delivery_fee_tiers.some((t) => t.fee < 0)) {
      errors.push("Fee can't be negative.");
    }
    const maxKms = draft.delivery_fee_tiers.map((t) => t.maxKm);
    if (new Set(maxKms).size !== maxKms.length) {
      errors.push("Each tier needs a different distance.");
    }
    return errors;
  }, [draft.delivery_fee_tiers]);
  const tiersInvalid = tierErrors.length > 0;

  const hasErrors =
    !!phoneError ||
    preorderInvalid ||
    lowStockInvalid ||
    monthlyLimitInvalid ||
    tiersInvalid;

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function updateTier(index: number, key: keyof DeliveryFeeTier, value: number) {
    setDraft((prev) => {
      const tiers = [...prev.delivery_fee_tiers];
      tiers[index] = { ...tiers[index], [key]: value };
      return { ...prev, delivery_fee_tiers: tiers };
    });
  }

  function addTier() {
    setDraft((prev) => {
      const last = prev.delivery_fee_tiers[prev.delivery_fee_tiers.length - 1];
      const nextTier: DeliveryFeeTier = last
        ? { maxKm: last.maxKm + 2, fee: last.fee + 2 }
        : { maxKm: 3, fee: 2 };
      return {
        ...prev,
        delivery_fee_tiers: [...prev.delivery_fee_tiers, nextTier],
      };
    });
  }

  function removeTier(index: number) {
    setDraft((prev) => ({
      ...prev,
      delivery_fee_tiers: prev.delivery_fee_tiers.filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    if (hasErrors || !isDirty) return;

    setSaving(true);
    const supabase = createClient();

    const payload: Draft = {
      ...draft,
      delivery_fee_tiers: [...draft.delivery_fee_tiers].sort(
        (a, b) => a.maxKm - b.maxKm,
      ),
    };

    const { data, error } = await supabase
      .from("site_settings")
      .update(payload)
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

      {/* Delivery Fee Tiers */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Truck className="h-4.5 w-4.5 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">
            Delivery fee tiers
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Distance-based ESTIMATE shown to customers at checkout — the real
          fee is still confirmed manually via WhatsApp, this just gives them
          a heads-up.
        </p>

        <div className="mt-3.5 space-y-2">
          {draft.delivery_fee_tiers.map((tier, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="shrink-0 text-xs text-slate-500">Up to</span>
              <div className="relative w-24">
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={tier.maxKm}
                  onChange={(e) =>
                    updateTier(index, "maxKm", Number(e.target.value))
                  }
                  aria-label={`Tier ${index + 1} max distance in km`}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-3 pr-8 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  km
                </span>
              </div>
              <span className="shrink-0 text-xs text-slate-500">→ RM</span>
              <div className="w-24">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={tier.fee}
                  onChange={(e) =>
                    updateTier(index, "fee", Number(e.target.value))
                  }
                  aria-label={`Tier ${index + 1} fee in RM`}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTier(index)}
                aria-label={`Remove tier ${index + 1}`}
                className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addTier}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add tier
        </button>

        {tiersInvalid && (
          <div className="mt-3 space-y-1">
            {tierErrors.map((err) => (
              <p key={err} className="text-xs text-red-500">
                {err}
              </p>
            ))}
          </div>
        )}

        <div className="mt-3.5 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>
            Beyond the last tier&apos;s distance, customers see
            &quot;outside our usual delivery range&quot; instead of an
            automatic fee.
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
