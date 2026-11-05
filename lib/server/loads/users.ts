import "server-only";

import { authedFetch } from "@/lib/api";
import type { RoleOption } from "@/lib/roles";

/** Role options for the user form's checkboxes. Never blocks the page. */
export async function loadRoles(): Promise<RoleOption[]> {
  try {
    return await authedFetch<RoleOption[]>("/api/v1/identity/users/roles");
  } catch {
    return [];
  }
}