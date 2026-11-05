import { Suspense } from "react";
import { PolicyForm } from "@/feature/policies/policy-form";
import { authedFetch } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import type { Catalog } from "@/lib/policies";
import { loadOrRedirect } from "@/lib/server/load";

async function NewPolicyContent() {
    await requireAdmin();

    const catalog = await loadOrRedirect(() =>
        authedFetch<Catalog>("/api/v1/authorization/catalog"),
    );

    return <PolicyForm catalog={catalog} />;
}

export default function NewPolicyPage() {
    return (
        <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
            <h1 className="mb-6 text-2xl font-bold">New policy</h1>
            <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
                <NewPolicyContent />
            </Suspense>
        </main>
    );
}