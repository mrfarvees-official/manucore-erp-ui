import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { cardClass } from "@/components/ui/styles";
import { requireUser } from "@/lib/auth/session";
import { loadTenantName } from "@/lib/server/loads/tenant";

async function ProfileContent() {
  const user = await requireUser();
  const tenantName = await loadTenantName(user);

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <section className={cardClass}>
        <h2 className="mb-4 text-base font-semibold">Profile</h2>
        <dl className="grid grid-cols-[7rem_1fr] gap-y-3 text-sm">
          <dt className="text-gray-500">Name</dt>
          <dd className="text-gray-900">{user.name}</dd>

          <dt className="text-gray-500">Email</dt>
          <dd className="text-gray-900">{user.email}</dd>

          <dt className="text-gray-500">Company</dt>
          <dd className="text-gray-900">{tenantName}</dd>

          <dt className="text-gray-500">User ID</dt>
          <dd className="flex flex-wrap items-center gap-2">
            <span className="break-all font-mono text-xs text-gray-700">
              {user.id}
            </span>
            <CopyButton value={user.id} />
          </dd>
        </dl>
        <p className="mt-4 text-xs text-gray-500">
          Editing your own profile will be available later.
        </p>
      </section>

      <section className={cardClass}>
        <h2 className="mb-4 text-base font-semibold">Roles</h2>
        {user.roles.length === 0 ? (
          <p className="text-sm text-gray-500">No roles assigned.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <Badge key={role} tone={role === "ADMIN" ? "info" : "neutral"}>
                {role}
              </Badge>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">My profile</h1>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <ProfileContent />
      </Suspense>
    </main>
  );
}
