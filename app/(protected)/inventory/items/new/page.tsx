import { Suspense } from "react";
import { ItemForm } from "@/feature/items/item-form";
import { requirePermission } from "@/lib/auth/session";
import { loadCategories } from "@/lib/server/loads/catalog";

async function NewItemContent() {
  await requirePermission("INVENTORY.ITEMS:CREATE");

  return <ItemForm categories={await loadCategories()} />;
}

export default function NewItemPage() {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">New item</h1>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <NewItemContent />
      </Suspense>
    </main>
  );
}
