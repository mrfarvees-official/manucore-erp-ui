import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/styles";
import { ITEM_TYPES, ITEM_TYPE_LABELS } from "@/lib/items";
import { CATALOG_PATH, type CatalogFilters } from "./filters";

const selectClass = `${fieldClass} w-auto`;

export function CatalogFilterBar({
  filters,
  categories,
  filtered,
}: {
  filters: CatalogFilters;
  categories: string[];
  filtered: boolean;
}) {
  return (
    <form
      action={CATALOG_PATH}
      className="mb-6 flex flex-wrap items-center gap-2"
    >
      <input
        type="search"
        name="q"
        defaultValue={filters.q}
        aria-label="Search catalog"
        placeholder="Search by SKU or name"
        maxLength={100}
        className={`${fieldClass} max-w-xs`}
      />
      <select
        name="category"
        defaultValue={filters.category}
        aria-label="Category"
        className={selectClass}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        name="type"
        defaultValue={filters.type}
        aria-label="Type"
        className={selectClass}
      >
        <option value="">All types</option>
        {ITEM_TYPES.map((t) => (
          <option key={t} value={t}>
            {ITEM_TYPE_LABELS[t]}
          </option>
        ))}
      </select>
      <select
        name="stock"
        defaultValue={filters.stock}
        aria-label="Stock level"
        className={selectClass}
      >
        <option value="ALL">All stock levels</option>
        <option value="LOW">Low stock</option>
        <option value="OUT">Out of stock</option>
      </select>
      <select
        name="status"
        defaultValue={filters.status}
        aria-label="Status"
        className={selectClass}
      >
        <option value="ACTIVE">Active</option>
        <option value="ARCHIVED">Archived</option>
        <option value="ALL">Active and archived</option>
      </select>
      <Button type="submit" variant="secondary">
        Apply
      </Button>
      {filtered && (
        <Link href={CATALOG_PATH} className={buttonClasses({ variant: "link" })}>
          Clear
        </Link>
      )}
    </form>
  );
}
