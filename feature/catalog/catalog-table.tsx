import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { AdjustStockButton } from "@/feature/items/adjust-stock-button";
import { ITEM_TYPE_LABELS, type Item } from "@/lib/items";

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
});

function StatusBadge({ item }: { item: Item }) {
  if (!item.active) return <Badge>Archived</Badge>;
  if (item.quantity === 0) return <Badge tone="danger">Out of stock</Badge>;
  if (item.lowStock) return <Badge tone="warning">Low stock</Badge>;

  return <Badge tone="success">In stock</Badge>;
}

export function CatalogTable({
  items,
  can,
  emptyMessage,
}: {
  items: Item[];
  can: { update: boolean; adjust: boolean };
  emptyMessage: string;
}) {
  const hasActions = can.update || can.adjust;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3 text-right">Quantity</th>
            <th className="px-4 py-3 text-right">Reorder at</th>
            <th className="px-4 py-3">Status</th>
            {hasActions && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id} className={item.active ? "" : "bg-gray-50/60"}>
              <td className="px-4 py-3 font-medium text-gray-900">
                {item.sku}
              </td>
              <td
                className="max-w-xs truncate px-4 py-3"
                title={item.description ?? item.name}
              >
                {item.name}
              </td>
              <td className="px-4 py-3">
                {item.type ? (
                  <Badge tone="info">{ITEM_TYPE_LABELS[item.type]}</Badge>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {item.category ?? <span className="text-gray-400">—</span>}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                {numberFormat.format(item.quantity)}{" "}
                <span className="text-gray-500">{item.unit}</span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                {item.reorderLevel !== null
                  ? numberFormat.format(item.reorderLevel)
                  : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge item={item} />
              </td>
              {hasActions && (
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-4">
                    {can.adjust && <AdjustStockButton item={item} />}
                    {can.update && (
                      <Link
                        href={`/inventory/items/${item.id}`}
                        className={buttonClasses({ variant: "link" })}
                      >
                        Edit
                      </Link>
                    )}
                  </span>
                </td>
              )}
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={hasActions ? 8 : 7}
                className="px-4 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
