import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FilterForm } from "@/components/ui/filter-form";
import { Pagination } from "@/components/ui/pagination";
import { inlineFieldClass } from "@/components/ui/styles";
import { AuditTable } from "@/feature/audit/audit-table";
import { authedFetch } from "@/lib/api";
import { AUDIT_TARGET_TYPES, type AuditPage } from "@/lib/audit";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { loadOrRedirect } from "@/lib/server/load";

type SearchParams = Promise<{
  page?: string;
  q?: string;
  type?: string;
  target?: string;
  actor?: string;
}>;

type Filters = { q: string; type: string; target: string; actor: string };

function auditHref(filters: Filters, page = 0) {
  const params = new URLSearchParams();

  if (page > 0) params.set("page", String(page));
  if (filters.q) params.set("q", filters.q);
  if (filters.type) params.set("type", filters.type);
  if (filters.target) params.set("target", filters.target);
  if (filters.actor) params.set("actor", filters.actor);

  const query = params.toString();

  return query ? `/admin/audit?${query}` : "/admin/audit";
}

async function AuditContent({ searchParams }: { searchParams: SearchParams }) {
  const me = await requirePermission("IDENTITY.AUDIT:READ");

  const raw = await searchParams;
  const filters: Filters = {
    q: (raw.q ?? "").trim().slice(0, 100),
    type: AUDIT_TARGET_TYPES.find((t) => t === raw.type) ?? "",
    target: (raw.target ?? "").trim().slice(0, 100),
    actor: (raw.actor ?? "").trim().slice(0, 100),
  };
  const pageNumber = Math.max(0, Number.parseInt(raw.page ?? "0", 10) || 0);

  const query = new URLSearchParams({
    page: String(pageNumber),
    size: "20",
    q: filters.q,
    targetType: filters.type,
    targetId: filters.target,
    actorId: filters.actor,
  });

  const data = await loadOrRedirect(() =>
    authedFetch<AuditPage>(`/api/v1/identity/audit?${query.toString()}`),
  );

  if (
    data.items.length === 0 &&
    data.totalPages > 0 &&
    pageNumber >= data.totalPages
  ) {
    redirect(auditHref(filters, data.totalPages - 1));
  }

  const filtered = Boolean(
    filters.q || filters.type || filters.target || filters.actor,
  );
  const from = data.totalElements === 0 ? 0 : data.page * data.size + 1;
  const to = data.page * data.size + data.items.length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="mt-1 text-sm text-gray-600">
          A record of every change to users, roles, company settings and
          domains. Entries cannot be edited.
        </p>
      </div>

      <FilterForm
        showClear={filtered}
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          aria-label="Search the audit log"
          placeholder="Search by person, target or action"
          maxLength={100}
          className={`${inlineFieldClass} min-w-48 flex-1`}
        />
        <select
          name="type"
          defaultValue={filters.type}
          aria-label="Type"
          className={inlineFieldClass}
        >
          <option value="">All types</option>
          {AUDIT_TARGET_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="search"
          name="target"
          defaultValue={filters.target}
          aria-label="Target ID"
          placeholder="Target ID"
          maxLength={100}
          className={`${inlineFieldClass} w-40`}
        />
        <input
          type="search"
          name="actor"
          defaultValue={filters.actor}
          aria-label="Actor ID"
          placeholder="Actor ID"
          maxLength={100}
          className={`${inlineFieldClass} w-40`}
        />
        <span className="ml-auto text-sm text-gray-500">
          {from}–{to} of {data.totalElements}
        </span>
      </FilterForm>

      <AuditTable
        events={data.items}
        timeZone={me.timezone ?? "UTC"}
        locale={me.locale ?? "en-US"}
        canViewUsers={can(me, "IDENTITY.USERS:READ")}
      />

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        totalElements={data.totalElements}
        noun="events"
        hrefFor={(p) => auditHref(filters, p)}
      />
    </>
  );
}

export default function AuditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <AuditContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
