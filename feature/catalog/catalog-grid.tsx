import type { Item } from "@/lib/items";
import { CatalogCard } from "./catalog-card";

export function CatalogGrid({
  items,
  filtered,
  can,
}: {
  items: Item[];
  filtered: boolean;
  can: { update: boolean; adjust: boolean };
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-gray-500">
        {filtered ? "No items match these filters." : "No items yet."}
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <CatalogCard key={item.id} item={item} can={can} />
      ))}
    </div>
  );
}
