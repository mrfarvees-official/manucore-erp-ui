import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { cardClass } from "@/components/ui/styles";
import { AdjustStockButton } from "@/feature/items/adjust-stock-button";
import { ITEM_TYPE_LABELS, type Item } from "@/lib/items";

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
});

export function CatalogCard({
  item,
  can,
}: {
  item: Item;
  can: { update: boolean; adjust: boolean };
}) {
  const out = item.quantity === 0;

  return (
    <article
      className={`${cardClass} flex flex-col ${item.active ? "" : "opacity-70"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-xs text-gray-500">{item.sku}</p>
          <h3
            className="mt-0.5 truncate text-base font-semibold text-gray-900"
            title={item.name}
          >
            {item.name}
          </h3>
        </div>
        {!item.active && <Badge>Archived</Badge>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {item.type && <Badge tone="info">{ITEM_TYPE_LABELS[item.type]}</Badge>}
        {item.category && <Badge>{item.category}</Badge>}
        {!item.type && !item.category && (
          <span className="text-xs text-gray-400">Unclassified</span>
        )}
      </div>

      <p className="mt-3 line-clamp-2 min-h-10 text-sm text-gray-600">
        {item.description ?? "No description."}
      </p>

      <div className="mt-4 flex items-end justify-between border-t border-gray-100 pt-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">
            In stock
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {numberFormat.format(item.quantity)}{" "}
            <span className="text-sm font-normal text-gray-500">
              {item.unit}
            </span>
          </p>
          {item.reorderLevel !== null && (
            <p className="text-xs text-gray-500">
              Reorder at {numberFormat.format(item.reorderLevel)}
            </p>
          )}
        </div>
        {out ? (
          <Badge tone="danger">Out of stock</Badge>
        ) : item.lowStock ? (
          <Badge tone="warning">Low stock</Badge>
        ) : (
          <Badge tone="success">In stock</Badge>
        )}
      </div>

      {(can.adjust || can.update) && (
        <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3">
          {can.adjust && <AdjustStockButton item={item} />}
          {can.update && (
            <Link
              href={`/inventory/items/${item.id}`}
              className={buttonClasses({ variant: "link" })}
            >
              Edit
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
