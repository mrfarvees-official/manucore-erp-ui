"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cardClass, fieldClass, labelClass } from "@/components/ui/styles";
import { ITEM_TYPES, ITEM_TYPE_LABELS, type Item } from "@/lib/items";

const DECIMAL = /^\d{1,16}(\.\d{1,3})?$/;
const UNITS = ["pcs", "kg", "g", "l", "ml", "m", "cm", "box", "set"];
const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
});

export function ItemForm({
  item,
  categories = [],
}: {
  item?: Item;
  categories?: string[];
}) {
  const router = useRouter();
  const [sku, setSku] = useState(item?.sku ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [unit, setUnit] = useState(item?.unit ?? "");
  const [quantity, setQuantity] = useState("0");
  const [category, setCategory] = useState(item?.category ?? "");
  const [type, setType] = useState<string>(item?.type ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [reorderLevel, setReorderLevel] = useState(
    item?.reorderLevel != null ? String(item.reorderLevel) : "",
  );
  const [archived, setArchived] = useState(item ? !item.active : false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!item && !DECIMAL.test(quantity.trim())) {
      setError("Quantity must be 0 or more, with up to 3 decimals.");
      return;
    }

    if (reorderLevel.trim() && !DECIMAL.test(reorderLevel.trim())) {
      setError("Reorder level must be 0 or more, with up to 3 decimals.");
      return;
    }

    const catalogFields = {
      category: category.trim() || undefined,
      type: type || undefined,
      description: description.trim() || undefined,
      reorderLevel: reorderLevel.trim() ? Number(reorderLevel) : undefined,
    };

    setSaving(true);

    try {
      const response = await fetch(
        item ? `/api/v1/items/${item.id}` : "/api/v1/items",
        {
          method: item ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            item
              ? { name, unit, ...catalogFields, archived }
              : {
                  sku,
                  name,
                  unit,
                  quantity: Number(quantity),
                  ...catalogFields,
                },
          ),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message ?? "Unable to save the item.");
        return;
      }

      router.push("/inventory/items");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <section className={`${cardClass} space-y-4`}>
        <h2 className="text-base font-semibold">Basics</h2>

        <div>
          <label htmlFor="item-sku" className={labelClass}>
            SKU
          </label>
          <input
            id="item-sku"
            required
            maxLength={64}
            value={sku}
            disabled={!!item}
            onChange={(e) => setSku(e.target.value)}
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            {item
              ? "The SKU cannot be changed."
              : "Stored in upper case and must be unique."}
          </p>
        </div>

        <div>
          <label htmlFor="item-name" className={labelClass}>
            Name
          </label>
          <input
            id="item-name"
            required
            maxLength={200}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="item-unit" className={labelClass}>
            Unit
          </label>
          <input
            id="item-unit"
            required
            maxLength={20}
            list="item-units"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className={fieldClass}
          />
          <datalist id="item-units">
            {UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </div>

        {item ? (
          <p className="text-sm text-gray-600">
            Current quantity:{" "}
            <span className="font-medium">
              {numberFormat.format(item.quantity)} {item.unit}
            </span>
            . Change it with Adjust on the items list.
          </p>
        ) : (
          <div>
            <label htmlFor="item-quantity" className={labelClass}>
              Initial quantity
            </label>
            <input
              id="item-quantity"
              required
              inputMode="decimal"
              autoComplete="off"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={fieldClass}
            />
          </div>
        )}
      </section>

      <section className={`${cardClass} space-y-4`}>
        <h2 className="text-base font-semibold">Catalog details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="item-category" className={labelClass}>
              Category
            </label>
            <input
              id="item-category"
              maxLength={100}
              list="item-categories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={fieldClass}
            />
            <datalist id="item-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="item-type" className={labelClass}>
              Type
            </label>
            <select
              id="item-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={fieldClass}
            >
              <option value="">Unclassified</option>
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ITEM_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="item-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="item-description"
            rows={3}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="item-reorder" className={labelClass}>
            Reorder level
          </label>
          <input
            id="item-reorder"
            inputMode="decimal"
            autoComplete="off"
            placeholder="Optional"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(e.target.value)}
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            The catalog flags the item as low stock when its quantity is at or
            below this level.
          </p>
        </div>

        {item && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
            />
            Archived (hidden from the catalog by default)
          </label>
        )}
      </section>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <Button
          variant="secondary"
          onClick={() => router.push("/inventory/items")}
        >
          Cancel
        </Button>
        <Button type="submit" loading={saving} loadingText="Saving...">
          {item ? "Save changes" : "Create item"}
        </Button>
      </div>
    </form>
  );
}
