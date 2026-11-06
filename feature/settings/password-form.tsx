"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { cardClass, fieldClass, labelClass } from "@/components/ui/styles";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setDone(false);

    if (next.length < 8) {
      setError("The new password must be at least 8 characters.");
      return;
    }

    if (new TextEncoder().encode(next).length > 72) {
      setError("The new password is too long (72 bytes at most).");
      return;
    }

    if (next !== confirm) {
      setError("The new passwords do not match.");
      return;
    }

    if (next === current) {
      setError("The new password must be different from the current one.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/v1/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message ?? "Unable to change the password.");
        return;
      }

      setCurrent("");
      setNext("");
      setConfirm("");
      setDone(true);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} space-y-4`}>
      <h2 className="text-base font-semibold">Change password</h2>

      <div>
        <label htmlFor="pw-current" className={labelClass}>
          Current password
        </label>
        <input
          id="pw-current"
          type="password"
          required
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pw-new" className={labelClass}>
            New password
          </label>
          <input
            id="pw-new"
            type="password"
            required
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="pw-confirm" className={labelClass}>
            Confirm new password
          </label>
          <input
            id="pw-confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        At least 8 characters. Sessions that are already signed in stay valid
        until they expire (up to an hour).
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {done && <p className="text-sm text-green-700">Password changed.</p>}

      <div className="flex justify-end">
        <Button type="submit" loading={saving} loadingText="Saving...">
          Change password
        </Button>
      </div>
    </form>
  );
}
