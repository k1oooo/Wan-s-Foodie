"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, PackageX } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Category, MenuItem } from "../_lib/types";
import { CATEGORY_STYLE } from "../_lib/category-style";
import { capitalizeWords } from "../_lib/text";
import { toast } from "sonner";

const CATEGORIES: Category[] = ["chicken", "beef", "seafood"];

function formatRM(amount: number) {
  return `RM ${amount.toFixed(2)}`;
}

type DraftItem = Omit<MenuItem, "id" | "sort_order"> & { id?: string };

const EMPTY_DRAFT: DraftItem = {
  name: "",
  category: "chicken",
  price_per_box: 13,
  stock_boxes: 0,
  is_available: true,
};

export default function MenuClient({
  initialItems,
}: {
  initialItems: MenuItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [draft, setDraft] = useState<DraftItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);

  const grouped = useMemo(() => {
    return CATEGORIES.map((category) => ({
      category,
      items: items
        .filter((i) => i.category === category)
        .sort((a, b) => a.sort_order - b.sort_order),
    }));
  }, [items]);

  function openNew() {
    setDraft({ ...EMPTY_DRAFT });
  }

  function openEdit(item: MenuItem) {
    setDraft({ ...item });
  }

  async function saveDraft() {
    if (!draft || !draft.name.trim()) return;

    setSaving(true);

    const name = capitalizeWords(draft.name.trim());
    const supabase = createClient();

    if (draft.id) {
      const { error } = await supabase
        .from("menu_items")
        .update({
          name,
          category: draft.category,
          price_per_box: draft.price_per_box,
          stock_boxes: draft.stock_boxes,
          is_available: draft.is_available,
        })
        .eq("id", draft.id);

      if (!error) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === draft.id ? { ...i, ...draft, name, id: draft.id! } : i,
          ),
        );

        toast.success(`${name} updated successfully`);
      } else {
        toast.error("Couldn't save changes. Please try again.");
      }
    } else {
      const nextSortOrder =
        items.length > 0 ? Math.max(...items.map((i) => i.sort_order)) + 1 : 1;

      const { data, error } = await supabase
        .from("menu_items")
        .insert({
          name,
          category: draft.category,
          price_per_box: draft.price_per_box,
          stock_boxes: draft.stock_boxes,
          is_available: draft.is_available,
          sort_order: nextSortOrder,
        })
        .select()
        .single();

      if (!error && data) {
        setItems((prev) => [...prev, data as MenuItem]);

        toast.success(`${name} added successfully`);
      } else {
        toast.error("Couldn't add item. Please try again.");
      }
    }

    setSaving(false);
    setDraft(null);
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", deleteTarget.id);

    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));

      toast.success(`${deleteTarget.name} deleted successfully`);

      router.refresh();
    } else {
      toast.error("Couldn't delete item. Please try again.");
    }

    setDeleteTarget(null);
  }

  async function toggleAvailability(item: MenuItem) {
    const nextValue = !item.is_available;

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, is_available: nextValue } : i,
      ),
    );

    const supabase = createClient();

    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: nextValue })
      .eq("id", item.id);

    if (error) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, is_available: item.is_available } : i,
        ),
      );

      toast.error("Couldn't update availability. Please try again.");
    } else {
      toast.success(
        `${item.name} is now ${nextValue ? "available" : "unavailable"}`,
      );

      router.refresh();
    }
  }

  async function updateStock(item: MenuItem, stock_boxes: number) {
    const clamped = Math.max(0, stock_boxes);

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, stock_boxes: clamped } : i)),
    );

    const supabase = createClient();

    const { error } = await supabase
      .from("menu_items")
      .update({ stock_boxes: clamped })
      .eq("id", item.id);

    if (error) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, stock_boxes: item.stock_boxes } : i,
        ),
      );

      toast.error("Couldn't update stock. Please try again.");
    } else {
      toast.success(`${item.name} stock updated`);

      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>

      {grouped.map(({ category, items: categoryItems }) => (
        <div
          key={category}
          className="rounded-xl border border-slate-200 bg-white"
        >
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 sm:px-5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${CATEGORY_STYLE[category].dot}`}
            />

            <h2 className="text-sm font-semibold text-slate-900">
              {CATEGORY_STYLE[category].label}
            </h2>

            <span className="text-xs text-slate-400">
              ({categoryItems.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5 sm:px-5">Item</th>
                  <th className="px-4 py-2.5 sm:px-5">Price / box</th>
                  <th className="px-4 py-2.5 sm:px-5">Stock (boxes)</th>
                  <th className="px-4 py-2.5 sm:px-5">Available</th>
                  <th className="px-4 py-2.5 text-right sm:px-5">Actions</th>
                </tr>
              </thead>

              <tbody>
                {categoryItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-4 py-3 sm:px-5">
                      <span className="font-medium text-slate-900">
                        {item.name}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-slate-700 sm:px-5">
                      {formatRM(item.price_per_box)}
                    </td>

                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={item.stock_boxes}
                          onChange={(e) =>
                            updateStock(item, Number(e.target.value))
                          }
                          className="w-16 rounded-md border border-slate-200 px-2 py-1 text-sm tabular-nums focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />

                        {item.stock_boxes === 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                            <PackageX className="h-3.5 w-3.5" />
                            Out of stock
                          </span>
                        )}

                        {item.stock_boxes > 0 && item.stock_boxes <= 5 && (
                          <span className="text-xs font-medium text-amber-600">
                            Low
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 sm:px-5">
                      <button
                        onClick={() => toggleAvailability(item)}
                        role="switch"
                        aria-checked={item.is_available}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          item.is_available ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            item.is_available
                              ? "translate-x-4.5"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>

                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          aria-label={`Edit ${item.name}`}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(item)}
                          aria-label={`Delete ${item.name}`}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {categoryItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-slate-400 sm:px-5"
                    >
                      No items in this category yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Add/Edit modal */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                {draft.id ? "Edit item" : "Add item"}
              </h3>

              <button
                onClick={() => setDraft(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  Name
                </label>

                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      name: capitalizeWords(e.target.value),
                    })
                  }
                  placeholder="e.g. Chicken Curry"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Category
                  </label>

                  <select
                    value={draft.category}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        category: e.target.value as Category,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_STYLE[c].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Price / box (RM)
                  </label>

                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={draft.price_per_box}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        price_per_box: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">
                  Stock (boxes)
                </label>

                <input
                  type="number"
                  min={0}
                  value={draft.stock_boxes}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      stock_boxes: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={draft.is_available}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      is_available: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                Visible on customer site
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDraft(null)}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={saveDraft}
                disabled={!draft.name.trim() || saving}
                className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl">
            <h3 className="text-base font-semibold text-slate-900">
              Delete {deleteTarget.name}?
            </h3>

            <p className="mt-1.5 text-sm text-slate-500">
              This removes it from the menu. Past orders that included this item
              are not affected.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
