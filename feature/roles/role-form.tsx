"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cardClass, fieldClass, labelClass } from "@/components/ui/styles";
import type { Role } from "@/lib/roles";

const NAME = /^[A-Za-z][A-Za-z0-9_]{1,49}$/;

export function RoleForm({ role }: { role?: Role }) {
  const router = useRouter();
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!role && !NAME.test(name.trim())) {
      setError(
        "A role name starts with a letter and may contain letters, digits and underscores (2 to 50 characters).",
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        role ? `/api/v1/roles/${role.id}` : "/api/v1/roles",
        {
          method: role ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            role
              ? { description: description.trim() || undefined }
              : {
                  name: name.trim(),
                  description: description.trim() || undefined,
                },
          ),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message ?? "Unable to save the role.");
        return;
      }

      router.push("/admin/roles");
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
          <label htmlFor="role-name" className={labelClass}>
            Name
          </label>
          <input
            id="role-name"
            required
            maxLength={50}
            autoComplete="off"
            value={name}
            disabled={!!role}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            {role
              ? "The name cannot be changed because policies refer to it."
              : "Stored in upper case, e.g. PURCHASER. Policies use this exact name."}
          </p>
        </div>

        <div>
          <label htmlFor="role-description" className={labelClass}>
            Description
          </label>
          <input
            id="role-description"
            maxLength={255}
            value={description}
            placeholder="What people with this role do"
            onChange={(e) => setDescription(e.target.value)}
            className={fieldClass}
          />
        </div>
      </section>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <Button variant="secondary" onClick={() => router.push("/admin/roles")}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} loadingText="Saving...">
          {role ? "Save changes" : "Create role"}
        </Button>
      </div>
    </form>
  );
}
