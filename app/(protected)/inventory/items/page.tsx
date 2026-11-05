import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { buttonClasses } from "@/components/ui/button";
import { FilterForm } from "@/components/ui/filter-form";
import { Pagination } from "@/components/ui/pagination";
import { inlineFieldClass } from "@/components/ui/styles";
import { ItemsTable } from "@/feature/items/items-table";
import { authedFetch } from "@/lib/api";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import type { ItemPage } from "@/lib/items";
import { loadOrRedirect } from "@/lib/server/load";

const PAGE_SIZE = 20;

type SearchParams = Promise<{ page?: string; q?: string }>;

function itemsHref(page: number, q: string) {
    const params = new URLSearchParams();

    if (page > 0) {
        params.set("page", String(page));
    }

    if (q) {
        params.set("q", q);
    }

    const query = params.toString();

    return query ? `/inventory/items?${query}` : "/inventory/items";
}

async function ItemsContent({ searchParams }: { searchParams: SearchParams }) {
    const user = await requirePermission("INVENTORY.ITEMS:READ");

    const { page, q: rawQuery } = await searchParams;
    const q = (rawQuery ?? "").trim().slice(0, 100);
    const pageNumber = Math.max(0, Number.parseInt(page ?? "0", 10) || 0);

    const query = new URLSearchParams({
        page: String(pageNumber),
        size: String(PAGE_SIZE),
    });

    if (q) {
        query.set("q", q);
    }

    const data = await loadOrRedirect(() =>
        authedFetch<ItemPage>(`/api/v1/inventory/items?${query.toString()}`),
    );

    // The requested page no longer exists (for example its last item was deleted).
    if (data.items.length === 0 && data.totalPages > 0 && pageNumber >= data.totalPages) {
        redirect(itemsHref(data.totalPages - 1, q));
    }

    const from = data.totalElements === 0 ? 0 : data.page * data.size + 1;
    const to = data.page * data.size + data.items.length;

    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Items</h1>
                {can(user, "INVENTORY.ITEMS:CREATE") && (
                    <Link
                        href="/inventory/items/new"
                        className={buttonClasses({ variant: "primary" })}
                    >
                        New item
                    </Link>
                )}
            </div>

            <FilterForm showClear={q !== ""} className="mb-4 flex items-center gap-2">
                <input
                    type="search"
                    name="q"
                    defaultValue={q}
                    aria-label="Search items"
                    placeholder="Search by SKU or name"
                    maxLength={100}
                    className={`${inlineFieldClass} min-w-48 max-w-xs flex-1`}
                />
                <span className="ml-auto text-sm text-gray-500">
                    {from}–{to} of {data.totalElements}
                </span>
            </FilterForm>

            <ItemsTable
                items={data.items}
                can={{
                    update: can(user, "INVENTORY.ITEMS:UPDATE"),
                    delete: can(user, "INVENTORY.ITEMS:DELETE"),
                    adjust: can(user, "INVENTORY.ITEMS:ADJUST"),
                    history: can(user, "INVENTORY.ADJUSTMENTS:READ"),
                }}
                emptyMessage={q ? "No items match your search." : "No items yet."}
            />

            <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                noun="items"
                hrefFor={(p) => itemsHref(p, q)}
            />
        </>
    );
}

export default function ItemsPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
            <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
                <ItemsContent searchParams={searchParams} />
            </Suspense>
        </main>
    );
}