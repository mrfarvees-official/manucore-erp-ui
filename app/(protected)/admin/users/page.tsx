import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { buttonClasses } from "@/components/ui/button";
import { FilterForm } from "@/components/ui/filter-form";
import { Pagination } from "@/components/ui/pagination";
import { inlineFieldClass } from "@/components/ui/styles";
import { UsersTable } from "@/feature/users/users-table";
import { authedFetch } from "@/lib/api";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { loadOrRedirect } from "@/lib/server/load";
import type { UserPage } from "@/lib/users";

const PAGE_SIZE = 20;
const STATUSES = ["ALL", "ACTIVE", "INACTIVE"] as const;

type SearchParams = Promise<{ page?: string; q?: string; status?: string }>;

function usersHref(page: number, q: string, status: string) {
  const params = new URLSearchParams();

  if (page > 0) params.set("page", String(page));
  if (q) params.set("q", q);
  if (status !== "ALL") params.set("status", status);

  const query = params.toString();

  return query ? `/admin/users?${query}` : "/admin/users";
}

async function UsersContent({ searchParams }: { searchParams: SearchParams }) {
  const me = await requirePermission("IDENTITY.USERS:READ");

  const raw = await searchParams;
  const q = (raw.q ?? "").trim().slice(0, 100);
  const status = STATUSES.find((s) => s === raw.status) ?? "ALL";
  const pageNumber = Math.max(0, Number.parseInt(raw.page ?? "0", 10) || 0);

  const query = new URLSearchParams({
    page: String(pageNumber),
    size: String(PAGE_SIZE),
    q,
    status,
  });

  const data = await loadOrRedirect(() =>
    authedFetch<UserPage>(`/api/v1/identity/users?${query.toString()}`),
  );

  if (
    data.items.length === 0 &&
    data.totalPages > 0 &&
    pageNumber >= data.totalPages
  ) {
    redirect(usersHref(data.totalPages - 1, q, status));
  }

  const from = data.totalElements === 0 ? 0 : data.page * data.size + 1;
  const to = data.page * data.size + data.items.length;
  const filtered = q !== "" || status !== "ALL";

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        {can(me, "IDENTITY.USERS:CREATE") && (
          <Link
            href="/admin/users/new"
            className={buttonClasses({ variant: "primary" })}
          >
            New user
          </Link>
        )}
      </div>

      <FilterForm
        showClear={filtered}
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          aria-label="Search users"
          placeholder="Search by name or email"
          maxLength={100}
          className={`${inlineFieldClass} min-w-48 flex-1`}
        />
        <select
          name="status"
          defaultValue={status}
          data-default="ALL"
          aria-label="Status"
          className={inlineFieldClass}
        >
          <option value="ALL">All users</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <span className="ml-auto text-sm text-gray-500">
          {from}–{to} of {data.totalElements}
        </span>
      </FilterForm>

      <UsersTable
        users={data.items}
        currentUserId={me.id}
        canUpdate={can(me, "IDENTITY.USERS:UPDATE")}
        emptyMessage={
          filtered ? "No users match your search." : "No users yet."
        }
      />

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        noun="users"
        hrefFor={(p) => usersHref(p, q, status)}
      />
    </>
  );
}

export default function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <UsersContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
