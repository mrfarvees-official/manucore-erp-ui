import { notFound } from "next/navigation";
import { Suspense } from "react";
import { UserForm } from "@/feature/users/user-form";
import { authedFetch } from "@/lib/api";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { loadOrRedirect } from "@/lib/server/load";
import { loadRoles } from "@/lib/server/loads/users";
import type { User } from "@/lib/users";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function EditUserContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requirePermission("IDENTITY.USERS:UPDATE");

  const { id } = await params;

  if (!UUID.test(id)) {
    notFound();
  }

  const [user, roles] = await Promise.all([
    loadOrRedirect(() => authedFetch<User>(`/api/v1/identity/users/${id}`)),
    loadRoles(),
  ]);

  return (
    <UserForm
      key={user.id}
      user={user}
      roles={roles}
      isSelf={user.id === me.id}
      canManageRoles={can(me, "IDENTITY.ROLES:READ")}
    />
  );
}

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">Edit user</h1>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <EditUserContent params={params} />
      </Suspense>
    </main>
  );
}
