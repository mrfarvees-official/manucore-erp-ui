import { ITEM_TYPES } from "@/lib/items";

export const PAGE_SIZE = 24;
export const CATALOG_PATH = "/inventory/catalog";

export const STOCK_FILTERS = ["ALL", "LOW", "OUT"] as const;
export const STATUS_FILTERS = ["ACTIVE", "ARCHIVED", "ALL"] as const;

export type CatalogSearchParams = Promise<{
  q?: string;
  category?: string;
  type?: string;
  stock?: string;
  status?: string;
  page?: string;
}>;

export type CatalogFilters = {
  q: string;
  category: string;
  type: string;
  stock: string;
  status: string;
};

function pick<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.find((a) => a === value) ?? fallback;
}

/** Validate and normalise raw search params into filters and a page number. */
export function parseCatalogParams(raw: Awaited<CatalogSearchParams>) {
  const filters: CatalogFilters = {
    q: (raw.q ?? "").trim().slice(0, 100),
    category: (raw.category ?? "").trim().slice(0, 100),
    type: ITEM_TYPES.find((t) => t === raw.type) ?? "",
    stock: pick(raw.stock, STOCK_FILTERS, "ALL"),
    status: pick(raw.status, STATUS_FILTERS, "ACTIVE"),
  };
  const page = Math.max(0, Number.parseInt(raw.page ?? "0", 10) || 0);

  return { filters, page };
}

export function hasActiveFilters(filters: CatalogFilters) {
  return (
    filters.q !== "" ||
    filters.category !== "" ||
    filters.type !== "" ||
    filters.stock !== "ALL" ||
    filters.status !== "ACTIVE"
  );
}

/** Query string sent to the backend. */
export function backendQuery(filters: CatalogFilters, page: number) {
  return new URLSearchParams({
    page: String(page),
    size: String(PAGE_SIZE),
    q: filters.q,
    category: filters.category,
    type: filters.type,
    stock: filters.stock,
    status: filters.status,
  }).toString();
}

/** Browser URL for a filter set, omitting defaults. */
export function catalogHref(filters: CatalogFilters, page = 0) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.type) params.set("type", filters.type);
  if (filters.stock !== "ALL") params.set("stock", filters.stock);
  if (filters.status !== "ACTIVE") params.set("status", filters.status);
  if (page > 0) params.set("page", String(page));

  const query = params.toString();

  return query ? `${CATALOG_PATH}?${query}` : CATALOG_PATH;
}
