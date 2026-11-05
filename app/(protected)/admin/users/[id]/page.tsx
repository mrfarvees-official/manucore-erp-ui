import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { cardClass } from "@/components/ui/styles";
import { authedFetch } from "@/lib/api";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import type { AdjustmentPage } from "@/lib/items";
import { loadOrRedirect } from "@/lib/server/load";
import { loadRoles } from "@/lib/server/loads/users";
import type { User } from "@/lib/users";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

async function loadActivity(userId: string): Promise<AdjustmentPage | null> {
  try {
    return await authedFetch<AdjustmentPage>(
      `/api/v1/inventory/adjustments?actorId=${userId}&page=0&size=10`,
    );
  } catch {
    return null;
  }
}

async function ProfileContent({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePermission("IDENTITY.USERS:READ");

  const { id } = await params;

  if (!UUID.test(id)) {
    notFound();
  }

  const [user, roleOptions] = await Promise.all([
    loadOrRedirect(() => authedFetch<User>(`/api/v1/identity/users/${id}`)),
    loadRoles(),
  ]);

  const canSeeActivity = can(me, "INVENTORY.ADJUSTMENTS:READ");
  const activity = canSeeActivity ? await loadActivity(user.id) : null;
  const descriptions = new Map(roleOptions.map((r) => [r.name, r.description]));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <Badge tone={user.active ? "success" : "neutral"}>
              {user.active ? "Active" : "Inactive"}
            </Badge>
            {user.id === me.id && <Badge tone="info">You</Badge>}
          </div>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className={buttonClasses({ variant: "secondary" })}
          >
            Back to users
          </Link>
          {can(me, "IDENTITY.USERS:UPDATE") && (
            <Link
              href={`/admin/users/${user.id}/edit`}
              className={buttonClasses({ variant: "primary" })}
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className={cardClass}>
          <h2 className="mb-4 text-base font-semibold">Profile</h2>
          <dl className="grid grid-cols-[7rem_1fr] gap-y-3 text-sm">
            <dt className="text-gray-500">Name</dt>
            <dd className="text-gray-900">{user.name}</dd>

            <dt className="text-gray-500">Email</dt>
            <dd>
              <a
                href={`mailto:${user.email}`}
                className="text-blue-700 hover:underline"
              >
                {user.email}
              </a>
            </dd>

            <dt className="text-gray-500">Status</dt>
            <dd>{user.active ? "Active" : "Inactive (cannot sign in)"}</dd>

            <dt className="text-gray-500">User ID</dt>
            <dd className="flex flex-wrap items-center gap-2">
              <span className="break-all font-mono text-xs text-gray-700">
                {user.id}
              </span>
              <CopyButton value={user.id} />
            </dd>
          </dl>
        </section>

        <section className={cardClass}>
          <h2 className="mb-4 text-base font-semibold">Roles</h2>
          {user.roles.length === 0 ? (
            <p className="text-sm text-gray-500">No roles assigned.</p>
          ) : (
            <ul className="space-y-3">
              {user.roles.map((role) => (
                <li key={role} className="flex items-start gap-3 text-sm">
                  <Badge tone={role === "ADMIN" ? "info" : "neutral"}>
                    {role}
                  </Badge>
                  <span className="text-gray-600">
                    {descriptions.has(role)
                      ? (descriptions.get(role) ?? "No description.")
                      : "Not in the roles list."}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {canSeeActivity && (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent stock adjustments</h2>
            {activity && activity.totalElements > 0 && (
              <Link
                href={`/inventory/adjustments?user=${user.id}`}
                className={buttonClasses({ variant: "link" })}
              >
                View all {activity.totalElements}
              </Link>
            )}
          </div>

          {activity === null ? (
            <p className="rounded-lg border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
              Activity could not be loaded.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 text-right">Change</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activity.items.map((a) => (
                    <tr key={a.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                        {a.createdAt.slice(0, 16).replace("T", " ")} UTC
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/inventory/adjustments?item=${a.itemId}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {a.sku}
                        </Link>
                        <span className="ml-2 text-gray-500">{a.itemName}</span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold tabular-nums ${
                          a.delta > 0 ? "text-green-700" : "text-red-600"
                        }`}
                      >
                        {a.delta > 0 ? "+" : ""}
                        {numberFormat.format(a.delta)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-gray-600">
                        {numberFormat.format(a.quantityBefore)} →{" "}
                        {numberFormat.format(a.quantityAfter)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {a.reason ?? "—"}
                      </td>
                    </tr>
                  ))}
                  {activity.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        This user has not adjusted any stock yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <ProfileContent params={params} />
      </Suspense>
    </main>
  );
}