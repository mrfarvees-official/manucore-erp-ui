import { Suspense } from "react";
import AppShell from "@/feature/navigation/app-shell";
import { requireUser } from "@/lib/auth/session";
import { getNavigation } from "@/lib/navigation";
import { loadNotifications } from "@/lib/server/loads/notifications";
import { loadTenantName } from "@/lib/server/loads/tenant";

async function AuthGate({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  const [tenantName, notifications] = await Promise.all([
    loadTenantName(user),
    loadNotifications(),
  ]);

  return (
    <AppShell
      groups={getNavigation(user)}
      tenantName={tenantName}
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      }}
      notifications={notifications}
    >
      {children}
    </AppShell>
  );
}

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={null}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}