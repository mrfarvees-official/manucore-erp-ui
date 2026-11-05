"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cardClass, fieldClass, labelClass } from "@/components/ui/styles";
import type { RoleOption } from "@/lib/roles";
import type { User } from "@/lib/users";

function passwordProblem(password: string): string | null {
  if (password.length < 8) {
    return "The password must be at least 8 characters.";
  }

  if (new TextEncoder().encode(password).length > 72) {
    return "The password is too long (72 bytes at most).";
  }

  return null;
}

export function UserForm({
  user,
  roles,
  isSelf = false,
  canManageRoles = false,
}: {
  user?: User;
  roles: RoleOption[];
  isSelf?: boolean;
  canManageRoles?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [selected, setSelected] = useState<string[]>(user?.roles ?? []);
  const [active, setActive] = useState(user?.active ?? true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const wasAdmin = user?.roles.includes("ADMIN") ?? false;
  const known = new Set(roles.map((r) => r.name));
  // Roles the user still has that are no longer in the roles list can only be removed.
  const unknown = (user?.roles ?? []).filter((r) => !known.has(r));

  function toggleRole(role: string) {
    setSelected((current) =>
      current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (selected.length === 0) {
      setError("Choose at least one role.");
      return;
    }

    if (selected.some((r) => !known.has(r))) {
      setError("Remove the roles marked as not in the roles list.");
      return;
    }

    if (!user || password) {
      const problem = passwordProblem(password);

      if (problem) {
        setError(problem);
        return;
      }

      if (password !== confirm) {
        setError("The passwords do not match.");
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch(user ? `/api/users/${user.id}` : "/api/users", {
        method: user ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          user
            ? { name, roles: selected, active, password: password || undefined }
            : { name, email, password, roles: selected, active },
        ),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message ?? "Unable to save the user.");
        return;
      }

      router.push("/admin/users");
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
        <h2 className="text-base font-semibold">Account</h2>

        <div>
          <label htmlFor="user-name" className={labelClass}>
            Name
          </label>
          <input
            id="user-name"
            required
            maxLength={200}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="user-email" className={labelClass}>
            Email
          </label>
          <input
            id="user-email"
            type="email"
            required
            maxLength={254}
            autoComplete="off"
            value={email}
            disabled={!!user}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            {user
              ? "The email is the login name and cannot be changed."
              : "Used to sign in. It must be unique."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="user-password" className={labelClass}>
              {user ? "New password" : "Password"}
            </label>
            <input
              id="user-password"
              type="password"
              required={!user}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="user-confirm" className={labelClass}>
              Confirm password
            </label>
            <input
              id="user-confirm"
              type="password"
              required={!user || password !== ""}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
        <p className="-mt-2 text-xs text-gray-500">
          {user ? "Leave blank to keep the current password. " : ""}
          At least 8 characters.
        </p>
      </section>

      <section className={`${cardClass} space-y-3`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Roles</h2>
            <p className="mt-1 text-sm text-gray-500">
              Roles decide what the user can do through your policies. Changes
              apply to new sign-ins.
            </p>
          </div>
          {canManageRoles && (
            <Link
              href="/admin/roles"
              className="shrink-0 text-sm font-medium text-blue-700 hover:underline"
            >
              Manage roles
            </Link>
          )}
        </div>

        {roles.length === 0 && unknown.length === 0 && (
          <p className="text-sm text-gray-500">
            No roles exist yet. Create a role first, then come back to assign it.
          </p>
        )}

        <div className="space-y-2">
          {roles.map((role) => (
            <label key={role.name} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={selected.includes(role.name)}
                disabled={isSelf && wasAdmin && role.name === "ADMIN"}
                onChange={() => toggleRole(role.name)}
              />
              <span>
                <span className="font-medium">{role.name}</span>
                {role.description && (
                  <span className="block text-xs text-gray-500">
                    {role.description}
                  </span>
                )}
              </span>
            </label>
          ))}

          {unknown.map((role) => (
            <label key={role} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={selected.includes(role)}
                onChange={() => toggleRole(role)}
              />
              <span>
                <span className="font-medium">{role}</span>
                <span className="block text-xs text-amber-700">
                  Not in the roles list. Untick it to remove.
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            disabled={isSelf}
            onChange={(e) => setActive(e.target.checked)}
          />
          Active (inactive users cannot sign in)
        </label>
        {isSelf && (
          <p className="mt-2 text-xs text-gray-500">
            You cannot deactivate yourself or remove your own ADMIN role.
          </p>
        )}
      </section>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <Button variant="secondary" onClick={() => router.push("/admin/users")}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} loadingText="Saving...">
          {user ? "Save changes" : "Create user"}
        </Button>
      </div>
    </form>
  );
}