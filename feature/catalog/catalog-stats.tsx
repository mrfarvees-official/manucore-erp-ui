import Link from "next/link";
import type { CatalogSummary } from "@/lib/items";
import { CATALOG_PATH, type CatalogFilters } from "./filters";

function Stat({
  label,
  value,
  href,
  active,
}: {
  label: string;
  value: number;
  href?: string;
  active?: boolean;
}) {
  const body = (
    <div
      className={`rounded-lg border bg-white p-4 ${
        active ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

export function CatalogStats({
  summary,
  filters,
  filtered,
}: {
  summary: CatalogSummary;
  filters: CatalogFilters;
  filtered: boolean;
}) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Stat
        label="Active items"
        value={summary.activeItems}
        href={CATALOG_PATH}
        active={!filtered}
      />
      <Stat
        label="Low stock"
        value={summary.lowStock}
        href={`${CATALOG_PATH}?stock=LOW`}
        active={filters.stock === "LOW"}
      />
      <Stat
        label="Out of stock"
        value={summary.outOfStock}
        href={`${CATALOG_PATH}?stock=OUT`}
        active={filters.stock === "OUT"}
      />
      <Stat label="Categories" value={summary.categories.length} />
    </div>
  );
}
