import "server-only";

import type { CurrentUser } from "@/lib/auth/session";

/** Display name of the user's company, as stored in the tenants table. */
export async function loadTenantName(user: CurrentUser): Promise<string> {
  const name = user.tenantName?.trim();

  if (name) {
    return name;
  }

  // Fallback for an older backend: "acme-corp" -> "Acme Corp".
  return user.tenantId
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}