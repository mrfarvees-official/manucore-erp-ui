import { Suspense } from "react";
import { RoleForm } from "@/feature/roles/role-form";
import { requirePermission } from "@/lib/auth/session";

async function NewRoleContent() {
  await requirePermission("IDENTITY.ROLES:CREATE");

  return <RoleForm />;
}

export default function NewRolePage() {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">New role</h1>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <NewRoleContent />
      </Suspense>
    </main>
  );
}
