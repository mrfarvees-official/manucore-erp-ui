import { Suspense } from "react";
import { ItemForm } from "@/feature/items/item-form";
import { requirePermission } from "@/lib/auth/session";

async function NewItemContent() {
  await requirePermission("INVENTORY.ITEMS:CREATE");

  return <ItemForm />;
}

export default function NewItemPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">New item</h1>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <NewItemContent />
      </Suspense>
    </main>
  );
}
