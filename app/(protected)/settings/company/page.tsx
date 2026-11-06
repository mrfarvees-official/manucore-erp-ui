import Link from "next/link";
import { Suspense } from "react";
import { buttonClasses } from "@/components/ui/button";
import { CompanyForm } from "@/feature/settings/company-form";
import { authedFetch } from "@/lib/api";
import { can } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { loadOrRedirect } from "@/lib/server/load";
import type { TenantSettings } from "@/lib/settings";
import { currencies, timezones } from "@/lib/settings-options";

async function CompanyContent() {
  const me = await requirePermission("IDENTITY.TENANT:READ");

  const tenant = await loadOrRedirect(() =>
    authedFetch<TenantSettings>("/api/v1/identity/tenant"),
  );

  return (
    <>
      {can(me, "IDENTITY.AUDIT:READ") && (
        <p className="mb-4">
          <Link
            href="/admin/audit?type=TENANT"
            className={buttonClasses({ variant: "link" })}
          >
            View change history
          </Link>
        </p>
      )}
      <CompanyForm
        tenant={tenant}
        canEdit={can(me, "IDENTITY.TENANT:UPDATE")}
        timezones={timezones()}
        currencies={currencies()}
      />
    </>
  );
}

export default function CompanySettingsPage() {
  return (
    <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
      <CompanyContent />
    </Suspense>
  );
}
