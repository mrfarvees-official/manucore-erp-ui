"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cardClass, fieldClass, labelClass } from "@/components/ui/styles";
import { LOCALES } from "@/lib/settings-options";
import type { TenantSettings } from "@/lib/settings";

export function CompanyForm({
  tenant,
  canEdit,
  timezones,
  currencies,
}: {
  tenant: TenantSettings;
  canEdit: boolean;
  timezones: string[];
  currencies: string[];
}) {
  const router = useRouter();
  const [name, setName] = useState(tenant.name);
  const [timezone, setTimezone] = useState(tenant.timezone);
  const [currency, setCurrency] = useState(tenant.currency);
  const [locale, setLocale] = useState(tenant.locale);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    try {
      const response = await fetch("/api/v1/tenant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timezone, currency, locale }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message ?? "Unable to save the company settings.");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${cardClass} max-w-2xl space-y-4`}
    >
      <h2 className="text-base font-semibold">Company</h2>

      <div>
        <label htmlFor="co-name" className={labelClass}>
          Company name
        </label>
        <input
          id="co-name"
          required
          maxLength={200}
          value={name}
          disabled={!canEdit}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="co-tz" className={labelClass}>
            Time zone
          </label>
          <select
            id="co-tz"
            value={timezone}
            disabled={!canEdit}
            onChange={(e) => setTimezone(e.target.value)}
            className={fieldClass}
          >
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="co-cur" className={labelClass}>
            Currency
          </label>
          <select
            id="co-cur"
            value={currency}
            disabled={!canEdit}
            onChange={(e) => setCurrency(e.target.value)}
            className={fieldClass}
          >
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="co-loc" className={labelClass}>
            Locale
          </label>
          <select
            id="co-loc"
            value={locale}
            disabled={!canEdit}
            onChange={(e) => setLocale(e.target.value)}
            className={fieldClass}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        These are the defaults for everyone in the company. Each person can
        override the time zone and locale in My account.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-green-700">Saved.</p>}

      {canEdit && (
        <div className="flex justify-end">
          <Button type="submit" loading={saving} loadingText="Saving...">
            Save changes
          </Button>
        </div>
      )}
    </form>
  );
}
