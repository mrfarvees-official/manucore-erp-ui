import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { AdjustStockButton } from "@/feature/items/adjust-stock-button";
import { DeleteItemButton } from "@/feature/items/delete-item-button";
import type { Item } from "@/lib/items";

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
});

export function ItemsTable({
  items,
  can,
  emptyMessage,
}: {
  items: Item[];
  can: { update: boolean; delete: boolean; adjust: boolean; history: boolean };
  emptyMessage: string;
}) {
  const hasActions = can.update || can.delete || can.adjust || can.history;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Unit</th>
            <th className="px-4 py-3 text-right">Quantity</th>
            <th className="px-4 py-3">Updated</th>
            {hasActions && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 font-medium text-gray-900">
                {item.sku}
              </td>
              <td className="px-4 py-3">{item.name}</td>
              <td className="px-4 py-3 text-gray-600">{item.unit}</td>
              <td
                className={`px-4 py-3 text-right tabular-nums ${
                  item.quantity === 0 ? "font-semibold text-red-600" : ""
                }`}
              >
                {numberFormat.format(item.quantity)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                {item.updatedAt.slice(0, 16).replace("T", " ")} UTC
              </td>
              {hasActions && (
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-4">
                    {can.adjust && <AdjustStockButton item={item} />}
                    {can.history && (
                      <Link
                        href={`/inventory/adjustments?item=${item.id}`}
                        className={buttonClasses({ variant: "link" })}
                      >
                        History
                      </Link>
                    )}
                    {can.update && (
                      <Link
                        href={`/inventory/items/${item.id}`}
                        className={buttonClasses({ variant: "link" })}
                      >
                        Edit
                      </Link>
                    )}
                    {can.delete && (
                      <DeleteItemButton id={item.id} label={item.sku} />
                    )}
                  </span>
                </td>
              )}
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={hasActions ? 6 : 5}
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
