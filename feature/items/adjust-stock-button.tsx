"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fieldClass, labelClass } from "@/components/ui/styles";
import type { Item } from "@/lib/items";

const DELTA = /^-?\d{1,16}(\.\d{1,3})?$/;
const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
});

export function AdjustStockButton({ item }: { item: Item }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const amount = DELTA.test(delta.trim()) ? Number(delta) : null;
  const result =
    amount === null ? null : Math.round((item.quantity + amount) * 1000) / 1000;

  function open() {
    setDelta("");
    setReason("");
    setError("");
    dialog.current?.showModal();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (amount === null || amount === 0) {
      setError(
        "Enter a non-zero amount with up to 3 decimals, like 10 or -2.5.",
      );
      return;
    }

    if (result !== null && result < 0) {
      setError(
        `Insufficient stock: only ${numberFormat.format(item.quantity)} ${item.unit} available.`,
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/v1/items/${item.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delta: amount,
          reason: reason.trim() || undefined,
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(body.message ?? "Unable to adjust the stock.");
        return;
      }

      dialog.current?.close();
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="link" onClick={open}>
        Adjust
      </Button>

      <dialog
        ref={dialog}
        className="m-auto w-full max-w-sm rounded-lg p-0 backdrop:bg-black/40"
      >
        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <h2 className="text-base font-semibold">Adjust stock</h2>
            <p className="mt-1 text-sm text-gray-500">
              {item.sku} · {item.name}
            </p>
          </div>

          <p className="text-sm">
            Current:{" "}
            <span className="font-medium">
              {numberFormat.format(item.quantity)} {item.unit}
            </span>
          </p>

          <div>
            <label htmlFor={`delta-${item.id}`} className={labelClass}>
              Change (use - to remove stock)
            </label>
            <input
              id={`delta-${item.id}`}
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 10 or -2.5"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor={`reason-${item.id}`} className={labelClass}>
              Reason (optional)
            </label>
            <input
              id={`reason-${item.id}`}
              maxLength={255}
              autoComplete="off"
              placeholder="e.g. Damaged in transit, stock count"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={fieldClass}
            />
          </div>

          {result !== null && (
            <p className="text-sm text-gray-600">
              New quantity:{" "}
              <span
                className={
                  result < 0 ? "font-semibold text-red-600" : "font-semibold"
                }
              >
                {numberFormat.format(result)} {item.unit}
              </span>
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => dialog.current?.close()}>
              Cancel
            </Button>
            <Button type="submit" loading={saving} loadingText="Saving...">
              Apply
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
