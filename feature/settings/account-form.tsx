"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cardClass, fieldClass, labelClass } from "@/components/ui/styles";
import { LOCALES } from "@/lib/settings-options";
import type { AccountSettings } from "@/lib/settings";

export function AccountForm({
  settings,
  timezones,
}: {
  settings: AccountSettings;
  timezones: string[];
}) {
  const router = useRouter();
  const [name, setName] = useState(settings.name);
  const [timezone, setTimezone] = useState(settings.timezone ?? "");
  const [locale, setLocale] = useState(settings.locale ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    try {
      const response = await fetch("/api/v1/account/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          timezone: timezone || undefined,
          locale: locale || undefined,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message ?? "Unable to save your settings.");
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
    <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
      <h2 className="text-base font-semibold">My account</h2>

      <div>
        <label htmlFor="acc-name" className={labelClass}>
          Name
        </label>
        <input
          id="acc-name"
          required
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="acc-email" className={labelClass}>
          Email
        </label>
        <input
          id="acc-email"
          value={settings.email}
          disabled
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-gray-500">
          The email is your login name and cannot be changed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="acc-tz" className={labelClass}>
            Time zone
          </label>
          <select
            id="acc-tz"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={fieldClass}
          >
            <option value="">Company default</option>
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="acc-locale" className={labelClass}>
            Language and format
          </label>
          <select
            id="acc-locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className={fieldClass}
          >
            <option value="">Company default</option>
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-green-700">Saved.</p>}

      <div className="flex justify-end">
        <Button type="submit" loading={saving} loadingText="Saving...">
          Save changes
        </Button>
      </div>
    </form>
  );
}
