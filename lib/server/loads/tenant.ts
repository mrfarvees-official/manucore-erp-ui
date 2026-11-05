import "server-only";

import type { CurrentUser } from "@/lib/auth/session";

/**
 * Display name of the user's company. Attach the real lookup here later;
 * until then the tenant id is shown in a readable form ("acme-corp" -> "Acme Corp").
 */
export async function loadTenantName(user: CurrentUser): Promise<string> {
  return user.tenantId
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
