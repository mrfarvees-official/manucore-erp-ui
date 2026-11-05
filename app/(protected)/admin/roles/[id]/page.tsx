import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RoleForm } from "@/feature/roles/role-form";
import { authedFetch } from "@/lib/api";
import { requirePermission } from "@/lib/auth/session";
import type { Role } from "@/lib/roles";
import { loadOrRedirect } from "@/lib/server/load";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function EditRoleContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("IDENTITY.ROLES:UPDATE");

  const { id } = await params;

  if (!UUID.test(id)) {
    notFound();
  }

  const role = await loadOrRedirect(() =>
    authedFetch<Role>(`/api/v1/identity/roles/${id}`),
  );

  return <RoleForm key={role.id} role={role} />;
}

export default function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">Edit role</h1>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <EditRoleContent params={params} />
      </Suspense>
    </main>
  );
}
