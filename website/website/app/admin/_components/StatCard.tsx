import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "warning";
}

export default function StatCard({ label, value, icon: Icon, hint, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            tone === "warning" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-600"
          }`}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3 font-[family-name:var(--font-mono)] text-2xl font-semibold tabular-nums text-slate-900 sm:text-3xl">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
