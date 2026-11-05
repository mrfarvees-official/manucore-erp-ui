import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { DeleteRoleButton } from "@/feature/roles/delete-role-button";
import { authedFetch } from "@/lib/api";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import type { Role } from "@/lib/roles";
import { loadOrRedirect } from "@/lib/server/load";

async function RolesContent() {
  const me = await requirePermission("IDENTITY.ROLES:READ");

  const roles = await loadOrRedirect(() =>
    authedFetch<Role[]>("/api/v1/identity/roles"),
  );

  const canUpdate = can(me, "IDENTITY.ROLES:UPDATE");
  const canDelete = can(me, "IDENTITY.ROLES:DELETE");
  const hasActions = canUpdate || canDelete;

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roles</h1>
        {can(me, "IDENTITY.ROLES:CREATE") && (
          <Link
            href="/admin/roles/new"
            className={buttonClasses({ variant: "primary" })}
          >
            New role
          </Link>
        )}
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Roles are assigned to users. What a role may do is decided by your
        policies, which refer to the role by name.
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Users</th>
              <th className="px-4 py-3">Type</th>
              {hasActions && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-4 py-3 font-mono text-gray-900">
                  {role.name}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {role.description ?? <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {role.userCount}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={role.system ? "info" : "neutral"}>
                    {role.system ? "Built-in" : "Custom"}
                  </Badge>
                </td>
                {hasActions && (
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-4">
                      {canUpdate && (
                        <Link
                          href={`/admin/roles/${role.id}`}
                          className={buttonClasses({ variant: "link" })}
                        >
                          Edit
                        </Link>
                      )}
                      {canDelete && (
                        <DeleteRoleButton
                          id={role.id}
                          name={role.name}
                          blockedReason={
                            role.system
                              ? "Built-in roles cannot be deleted"
                              : role.userCount > 0
                                ? "Remove this role from its users first"
                                : undefined
                          }
                        />
                      )}
                    </span>
                  </td>
                )}
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td
                  colSpan={hasActions ? 5 : 4}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No roles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function RolesPage() {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <RolesContent />
      </Suspense>
    </main>
  );
}
