import "server-only";

import { authedFetch } from "@/lib/api";
import type { CatalogSummary } from "@/lib/items";

export async function loadCategories(): Promise<string[]> {
  try {
    const summary = await authedFetch<CatalogSummary>(
      "/api/v1/inventory/catalog/summary",
    );

    return summary.categories;
  } catch {
    return [];
  }
}