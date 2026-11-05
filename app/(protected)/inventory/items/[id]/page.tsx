import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ItemForm } from "@/feature/items/item-form";
import { authedFetch } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";
import type { Item } from "@/lib/items";
import { loadOrRedirect } from "@/lib/server/load";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function EditItemContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("INVENTORY.ITEMS:UPDATE");

  const { id } = await params;

  if (!UUID.test(id)) {
    notFound();
  }

  const item = await loadOrRedirect(() =>
    authedFetch<Item>(`/api/v1/inventory/items/${id}`),
  );

  return <ItemForm key={item.id} item={item} />;
}

export default function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">Edit item</h1>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <EditItemContent params={params} />
      </Suspense>
    </main>
  );
}
