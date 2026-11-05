import "server-only";

import { authedFetch } from "@/lib/api";

/** Role names for pickers. Never blocks the page. */
export async function loadRoleNames(): Promise<string[]> {
  try {
    const roles = await authedFetch<{ name: string }[]>(
      "/api/v1/identity/roles",
    );

    return roles.map((r) => r.name);
  } catch {
    return [];
  }
}
