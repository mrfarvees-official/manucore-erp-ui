import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { authedFetch } from "@/lib/api";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import type { AdjustmentPage } from "@/lib/items";
import { loadOrRedirect } from "@/lib/server/load";
import type { User } from "@/lib/users";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

type SearchParams = Promise<{ page?: string; item?: string; user?: string }>;

function pageHref(page: number, item?: string, user?: string) {
  const params = new URLSearchParams();

  if (page > 0) params.set("page", String(page));
  if (item) params.set("item", item);
  if (user) params.set("user", user);

  const query = params.toString();

  return query ? `/inventory/adjustments?${query}` : "/inventory/adjustments";
}

async function loadUserName(id: string): Promise<string | null> {
  try {
    const user = await authedFetch<User>(`/api/v1/identity/users/${id}`);

    return user.name;
  } catch {
    return null;
  }
}

async function AdjustmentsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const me = await requirePermission("INVENTORY.ADJUSTMENTS:READ");
  const canViewUsers = can(me, "IDENTITY.USERS:READ");

  const { page, item, user } = await searchParams;
  const pageNumber = Math.max(0, Number.parseInt(page ?? "0", 10) || 0);

  if (item !== undefined && !UUID.test(item)) notFound();
  if (user !== undefined && !UUID.test(user)) notFound();

  const query = new URLSearchParams({ page: String(pageNumber), size: "20" });

  if (item) query.set("itemId", item);
  if (user) query.set("actorId", user);

  const [data, actorName] = await Promise.all([
    loadOrRedirect(() =>
      authedFetch<AdjustmentPage>(
        `/api/v1/inventory/adjustments?${query.toString()}`,
      ),
    ),
    user && canViewUsers ? loadUserName(user) : Promise.resolve(null),
  ]);

  return (
    <>
      {(item || user) && (
        <p className="mb-4 text-sm text-gray-600">
          Showing adjustments
          {item && (
            <>
              {" "}
              for{" "}
              <span className="font-medium">
                {data.items[0]?.sku ?? "this item"}
              </span>
            </>
          )}
          {user && (
            <>
              {" "}
              made by{" "}
              <span className="font-medium">
                {actorName ?? `${user.slice(0, 8)}…`}
              </span>
            </>
          )}
          .{" "}
          <Link
            href="/inventory/adjustments"
            className="text-blue-700 hover:underline"
          >
            Show all
          </Link>
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3 text-right">Change</th>
              <th className="px-4 py-3 text-right">Quantity</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.map((a) => (
              <tr key={a.id}>
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                  {a.createdAt.slice(0, 16).replace("T", " ")} UTC
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{a.sku}</td>
                <td className="px-4 py-3">{a.itemName}</td>
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
                <td className="px-4 py-3 text-gray-600">{a.reason ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {a.actorId ? (
                    canViewUsers ? (
                      <Link
                        href={`/admin/users/${a.actorId}`}
                        title={`Open profile ${a.actorId}`}
                        className="text-blue-700 hover:underline"
                      >
                        {a.actorId.slice(0, 8)}…
                      </Link>
                    ) : (
                      <span className="text-gray-500" title={a.actorId}>
                        {a.actorId.slice(0, 8)}…
                      </span>
                    )
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No adjustments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        noun="adjustments"
        hrefFor={(p) => pageHref(p, item, user)}
      />
    </>
  );
}

export default function AdjustmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stock adjustments</h1>
        <Link
          href="/inventory/items"
          className={buttonClasses({ variant: "secondary" })}
        >
          Adjust stock from Items
        </Link>
      </div>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <AdjustmentsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}