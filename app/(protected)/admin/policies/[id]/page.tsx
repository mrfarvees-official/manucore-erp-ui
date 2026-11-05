import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PolicyForm } from "@/feature/policies/policy-form";
import { authedFetch } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import type { Catalog, Policy } from "@/lib/policies";
import { loadOrRedirect } from "@/lib/server/load";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function EditPolicyContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  if (!UUID.test(id)) {
    notFound();
  }

  const [policy, catalog] = await loadOrRedirect(() =>
    Promise.all([
      authedFetch<Policy>(`/api/v1/authorization/policies/${id}`),
      authedFetch<Catalog>("/api/v1/authorization/catalog"),
    ]),
  );

  return <PolicyForm key={policy.id} catalog={catalog} policy={policy} />;
}

export default function EditPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <h1 className="mb-6 text-2xl font-bold">Edit policy</h1>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <EditPolicyContent params={params} />
      </Suspense>
    </main>
  );
}
