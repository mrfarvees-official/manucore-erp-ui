import Link from "next/link";
import { Suspense } from "react";
import { DeletePolicyButton } from "@/feature/policies/delete-policy-button";
import { authedFetch } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import type { PolicyPage } from "@/lib/policies";
import { loadOrRedirect } from "@/lib/server/load";

async function PoliciesContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();

  const { page } = await searchParams;
  const pageNumber = Math.max(0, Number.parseInt(page ?? "0", 10) || 0);

  const data = await loadOrRedirect(() =>
    authedFetch<PolicyPage>(
      `/api/v1/authorization/policies?page=${pageNumber}&size=20`,
    ),
  );

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Effect</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Applies to</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <Link
                    href={`/admin/policies/${p.id}`}
                    className="hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.effect === "ALLOW"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {p.effect}
                  </span>
                </td>
                <td className="px-4 py-3">{p.action}</td>
                <td className="px-4 py-3">{p.resource}</td>
                <td className="px-4 py-3 text-gray-600">
                  {p.subjects.map((s) => `${s.type}:${s.id}`).join(", ")}
                </td>
                <td className="px-4 py-3">{p.priority}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                  {p.updatedAt.slice(0, 16).replace("T", " ")} UTC
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/policies/${p.id}`}
                    className="mr-4 text-sm font-medium text-blue-700 hover:underline"
                  >
                    Edit
                  </Link>
                  <DeletePolicyButton id={p.id} name={p.name} />
                </td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No policies yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Page {data.page + 1} of {data.totalPages} ({data.totalElements}{" "}
            policies)
          </span>
          <div className="flex gap-3">
            {data.page > 0 && (
              <Link
                href={`/admin/policies?page=${data.page - 1}`}
                className="text-blue-700 hover:underline"
              >
                Previous
              </Link>
            )}
            {data.page + 1 < data.totalPages && (
              <Link
                href={`/admin/policies?page=${data.page + 1}`}
                className="text-blue-700 hover:underline"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function PoliciesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Roles &amp; Policies</h1>
        <Link
          href="/admin/policies/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          New policy
        </Link>
      </div>
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <PoliciesContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
