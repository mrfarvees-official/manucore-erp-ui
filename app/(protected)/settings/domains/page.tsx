import Link from "next/link";
import { Suspense } from "react";
import { buttonClasses } from "@/components/ui/button";
import { DomainsPanel } from "@/feature/settings/domains-panel";
import { authedFetch } from "@/lib/api";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { loadOrRedirect } from "@/lib/server/load";
import type { TenantDomain } from "@/lib/settings";

async function DomainsContent() {
  const me = await requirePermission("IDENTITY.DOMAINS:READ");

  const domains = await loadOrRedirect(() =>
    authedFetch<TenantDomain[]>("/api/v1/identity/domains"),
  );

  return (
    <>
      <p className="mb-4 max-w-2xl text-sm text-gray-600">
        Your company can be reached on its own domains. The login page on a
        domain belongs to your company, and only your people can sign in there.
      </p>
      {can(me, "IDENTITY.AUDIT:READ") && (
        <p className="mb-4">
          <Link
            href="/admin/audit?type=DOMAIN"
            className={buttonClasses({ variant: "link" })}
          >
            View change history
          </Link>
        </p>
      )}
      <DomainsPanel
        domains={domains}
        can={{
          create: can(me, "IDENTITY.DOMAINS:CREATE"),
          manage: can(me, "IDENTITY.DOMAINS:UPDATE"),
          remove: can(me, "IDENTITY.DOMAINS:DELETE"),
        }}
      />
    </>
  );
}

export default function DomainsPage() {
  return (
    <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
      <DomainsContent />
    </Suspense>
  );
}
