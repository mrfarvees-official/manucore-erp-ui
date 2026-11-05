import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { buttonClasses } from "@/components/ui/button";
import { authedFetch } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";
import type { AdjustmentPage } from "@/lib/items";
import { loadOrRedirect } from "@/lib/server/load";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
});

type SearchParams = Promise<{ page?: string; item?: string }>;

function pageHref(page: number, item?: string) {
  const params = new URLSearchParams({ page: String(page) });

  if (item) {
    params.set("item", item);
  }

  return `/inventory/adjustments?${params.toString()}`;
}

async function AdjustmentsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePermission("INVENTORY.ADJUSTMENTS:READ");

  const { page, item } = await searchParams;
  const pageNumber = Math.max(0, Number.parseInt(page ?? "0", 10) || 0);

  if (item !== undefined && !UUID.test(item)) {
    notFound();
  }

  const query = new URLSearchParams({ page: String(pageNumber), size: "20" });

  if (item) {
    query.set("itemId", item);
  }

  const data = await loadOrRedirect(() =>
    authedFetch<AdjustmentPage>(
      `/api/v1/inventory/adjustments?${query.toString()}`,
    ),
  );

  return (
    <>
      {item && (
        <p className="mb-4 text-sm text-gray-600">
          Showing history for{" "}
          <span className="font-medium">
            {data.items[0]?.sku ?? "this item"}
          </span>
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
                <td
                  className="px-4 py-3 text-gray-500"
                  title={a.actorId ?? undefined}
                >
                  {a.actorId ? `${a.actorId.slice(0, 8)}…` : "—"}
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

      {data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Page {data.page + 1} of {data.totalPages} ({data.totalElements}{" "}
            adjustments)
          </span>
          <div className="flex gap-3">
            {data.page > 0 && (
              <Link
                href={pageHref(data.page - 1, item)}
                className="text-blue-700 hover:underline"
              >
                Previous
              </Link>
            )}
            {data.page + 1 < data.totalPages && (
              <Link
                href={pageHref(data.page + 1, item)}
                className="text-blue-700 hover:underline"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function AdjustmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8 text-gray-900">
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
