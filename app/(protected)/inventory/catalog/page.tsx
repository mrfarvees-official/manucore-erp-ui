import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { buttonClasses } from "@/components/ui/button";
import { FilterForm } from "@/components/ui/filter-form";
import { Pagination } from "@/components/ui/pagination";
import { inlineFieldClass } from "@/components/ui/styles";
import { CatalogCard } from "@/feature/catalog/catalog-card";
import { CatalogTable } from "@/feature/catalog/catalog-table";
import { authedFetch } from "@/lib/api";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import {
  ITEM_TYPES,
  ITEM_TYPE_LABELS,
  type CatalogSummary,
  type ItemPage,
} from "@/lib/items";
import { loadOrRedirect } from "@/lib/server/load";

const TABLE_PAGE_SIZE = 20;
const CARD_PAGE_SIZE = 24;
const STOCK_FILTERS = ["ALL", "LOW", "OUT"] as const;
const STATUS_FILTERS = ["ACTIVE", "ARCHIVED", "ALL"] as const;
const VIEWS = ["table", "cards"] as const;

type SearchParams = Promise<{
  q?: string;
  category?: string;
  type?: string;
  stock?: string;
  status?: string;
  view?: string;
  page?: string;
}>;

type Filters = {
  q: string;
  category: string;
  type: string;
  stock: string;
  status: string;
  view: string;
};

const DEFAULTS: Filters = {
  q: "",
  category: "",
  type: "",
  stock: "ALL",
  status: "ACTIVE",
  view: "table",
};

function pick<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.find((a) => a === value) ?? fallback;
}

function catalogHref(filters: Filters, page = 0) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.type) params.set("type", filters.type);
  if (filters.stock !== DEFAULTS.stock) params.set("stock", filters.stock);
  if (filters.status !== DEFAULTS.status) params.set("status", filters.status);
  if (filters.view !== DEFAULTS.view) params.set("view", filters.view);
  if (page > 0) params.set("page", String(page));

  const query = params.toString();

  return query ? `/inventory/catalog?${query}` : "/inventory/catalog";
}

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

async function CatalogContent({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePermission("INVENTORY.CATALOG:READ");

  const raw = await searchParams;
  const filters: Filters = {
    q: (raw.q ?? "").trim().slice(0, 100),
    category: (raw.category ?? "").trim().slice(0, 100),
    type: ITEM_TYPES.find((t) => t === raw.type) ?? "",
    stock: pick(raw.stock, STOCK_FILTERS, "ALL"),
    status: pick(raw.status, STATUS_FILTERS, "ACTIVE"),
    view: pick(raw.view, VIEWS, "table"),
  };
  const pageNumber = Math.max(0, Number.parseInt(raw.page ?? "0", 10) || 0);
  const pageSize = filters.view === "cards" ? CARD_PAGE_SIZE : TABLE_PAGE_SIZE;

  const query = new URLSearchParams({
    page: String(pageNumber),
    size: String(pageSize),
    q: filters.q,
    category: filters.category,
    type: filters.type,
    stock: filters.stock,
    status: filters.status,
  });

  const [data, summary] = await loadOrRedirect(() =>
    Promise.all([
      authedFetch<ItemPage>(`/api/v1/inventory/catalog?${query.toString()}`),
      authedFetch<CatalogSummary>("/api/v1/inventory/catalog/summary"),
    ]),
  );

  // The requested page no longer exists (for example after filtering).
  if (
    data.items.length === 0 &&
    data.totalPages > 0 &&
    pageNumber >= data.totalPages
  ) {
    redirect(catalogHref(filters, data.totalPages - 1));
  }

  const hasFilters =
    filters.q !== "" ||
    filters.category !== "" ||
    filters.type !== "" ||
    filters.stock !== "ALL" ||
    filters.status !== "ACTIVE";

  const from = data.totalElements === 0 ? 0 : data.page * data.size + 1;
  const to = data.page * data.size + data.items.length;
  const rowActions = {
    update: can(user, "INVENTORY.ITEMS:UPDATE"),
    adjust: can(user, "INVENTORY.ITEMS:ADJUST"),
  };
  const emptyMessage = hasFilters
    ? "No items match these filters."
    : "No items yet.";

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Catalog</h1>
        {can(user, "INVENTORY.ITEMS:CREATE") && (
          <Link
            href="/inventory/items/new"
            className={buttonClasses({ variant: "primary" })}
          >
            New item
          </Link>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Active items"
          value={summary.activeItems}
          href={catalogHref({ ...DEFAULTS, view: filters.view })}
          active={!hasFilters}
        />
        <Stat
          label="Low stock"
          value={summary.lowStock}
          href={catalogHref({ ...DEFAULTS, view: filters.view, stock: "LOW" })}
          active={filters.stock === "LOW"}
        />
        <Stat
          label="Out of stock"
          value={summary.outOfStock}
          href={catalogHref({ ...DEFAULTS, view: filters.view, stock: "OUT" })}
          active={filters.stock === "OUT"}
        />
        <Stat label="Categories" value={summary.categories.length} />
      </div>

      <FilterForm
        showClear={hasFilters}
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        <input
          type="hidden"
          name="view"
          value={filters.view}
          data-default={DEFAULTS.view}
        />
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          aria-label="Search catalog"
          placeholder="Search by SKU or name"
          maxLength={100}
          className={`${inlineFieldClass} min-w-48 flex-1`}
        />
        <select
          name="category"
          defaultValue={filters.category}
          aria-label="Category"
          className={inlineFieldClass}
        >
          <option value="">All categories</option>
          {summary.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={filters.type}
          aria-label="Type"
          className={inlineFieldClass}
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
          data-default={DEFAULTS.stock}
          aria-label="Stock level"
          className={inlineFieldClass}
        >
          <option value="ALL">All stock levels</option>
          <option value="LOW">Low stock</option>
          <option value="OUT">Out of stock</option>
        </select>
        <select
          name="status"
          defaultValue={filters.status}
          data-default={DEFAULTS.status}
          aria-label="Status"
          className={inlineFieldClass}
        >
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
          <option value="ALL">Active and archived</option>
        </select>
      </FilterForm>

      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {from}–{to} of {data.totalElements}
        </span>
        <div className="inline-flex overflow-hidden rounded-lg border border-gray-300">
          {VIEWS.map((v) => (
            <Link
              key={v}
              href={catalogHref({ ...filters, view: v })}
              aria-current={filters.view === v ? "page" : undefined}
              className={`px-3 py-1.5 font-medium capitalize ${
                filters.view === v
                  ? "bg-blue-50 text-blue-700"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {v}
            </Link>
          ))}
        </div>
      </div>

      {filters.view === "cards" ? (
        data.items.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center text-gray-500">
            {emptyMessage}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {data.items.map((item) => (
              <CatalogCard key={item.id} item={item} can={rowActions} />
            ))}
          </div>
        )
      ) : (
        <CatalogTable
          items={data.items}
          can={rowActions}
          emptyMessage={emptyMessage}
        />
      )}

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        noun="items"
        hrefFor={(p) => catalogHref(filters, p)}
      />
    </>
  );
}

export default function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}