import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

export type PermissionMatrix = {
  tenantId: string;
  userId: string;
  roles: string[];
  canManagePolicies: boolean;
  generatedAt: string;
  actions: string[];
  resources: string[];
  matrix: Record<string, Record<string, boolean>>;
  allowed: string[];
};

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  tenantName?: string;
  timezone?: string;
  locale?: string;
  currency?: string;
  roles: string[];
  permissionsAvailable: boolean;
  permissions: PermissionMatrix | null;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("mc_access")?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.SPRING_BOOT_API_URL}/api/v1/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as CurrentUser;
  } catch {
    return null;
  }
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();

  const isAdmin =
    user.roles.includes("ADMIN") ||
    user.permissions?.canManagePolicies === true;

  if (!isAdmin) notFound();

  return user;
}

export async function requirePermission(
  permission: string,
): Promise<CurrentUser> {
  const user = await requireUser();

  if (
    !user.roles.includes("ADMIN") &&
    !user.permissions?.allowed.includes(permission)
  ) {
    notFound();
  }

  return user;
}
