import { Suspense } from "react";
import { UserForm } from "@/feature/users/user-form";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { loadRoles } from "@/lib/server/loads/users";

async function NewUserContent() {
  const me = await requirePermission("IDENTITY.USERS:CREATE");

  return (
    <UserForm
      roles={await loadRoles()}
      canManageRoles={can(me, "IDENTITY.ROLES:READ")}
    />
  );
}

export default function NewUserPage() {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">New user</h1>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <NewUserContent />
      </Suspense>
    </main>
  );
}