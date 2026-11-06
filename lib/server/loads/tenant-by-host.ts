import "server-only";

import { backendFetch } from "@/lib/api";

export type TenantByHost = {
  tenantId: string;
  tenantName: string;
  domain: string;
};

/** Which company does this host belong to? Null when the host is unknown. */
export async function resolveTenantByHost(
  host: string,
): Promise<TenantByHost | null> {
  try {
    return await backendFetch<TenantByHost>(
      `/api/v1/auth/tenant?host=${encodeURIComponent(host)}`,
    );
  } catch {
    return null;
  }
}
