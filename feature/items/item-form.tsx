"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cardClass, fieldClass, labelClass } from "@/components/ui/styles";
import type { Item } from "@/lib/items";

const QUANTITY = /^\d{1,16}(\.\d{1,3})?$/;
const UNITS = ["pcs", "kg", "g", "l", "ml", "m", "cm", "box", "set"];
const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
});

export function ItemForm({ item }: { item?: Item }) {
  const router = useRouter();
  const [sku, setSku] = useState(item?.sku ?? "");
  const [name, setName] = useState(item?.name ?? "");
  const [unit, setUnit] = useState(item?.unit ?? "");
  const [quantity, setQuantity] = useState("0");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!item && !QUANTITY.test(quantity.trim())) {
      setError("Quantity must be 0 or more, with up to 3 decimals.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        item ? `/api/items/${item.id}` : "/api/items",
        {
          method: item ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            item
              ? { name, unit }
              : { sku, name, unit, quantity: Number(quantity) },
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
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <section className={`${cardClass} space-y-4`}>
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
