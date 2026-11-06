"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { cardClass, fieldClass, labelClass } from "@/components/ui/styles";
import type { TenantDomain } from "@/lib/settings";

export function DomainsPanel({
  domains,
  can,
}: {
  domains: TenantDomain[];
  can: { create: boolean; manage: boolean; remove: boolean };
}) {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function run(key: string, url: string, init: RequestInit) {
    setError("");
    setBusy(key);

    try {
      const response = await fetch(url, init);
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message ?? "That did not work.");
        return false;
      }

      router.refresh();
      return true;
    } catch {
      setError("Unable to connect. Please try again.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const ok = await run("add", "/api/v1/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });

    if (ok) setDomain("");
  }

  function remove(d: TenantDomain) {
    if (
      !window.confirm(
        `Remove ${d.domain}? Visitors will no longer reach your company on it.`,
      )
    ) {
      return;
    }

    void run(`rm-${d.id}`, `/api/v1/domains/${d.id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-6">
      {can.create && (
        <form onSubmit={add} className={`${cardClass} max-w-2xl`}>
          <label htmlFor="new-domain" className={labelClass}>
            Add a domain
          </label>
          <div className="flex gap-2">
            <input
              id="new-domain"
              required
              maxLength={253}
              placeholder="erp.example.com or acme.localhost"
              autoComplete="off"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className={fieldClass}
            />
            <Button
              type="submit"
              loading={busy === "add"}
              loadingText="Adding..."
            >
              Add
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            A subdomain of the platform domain is verified immediately. Any
            other domain needs a DNS TXT record before it works.
          </p>
        </form>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <section className="space-y-3">
        {domains.length === 0 && (
          <p className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
            No domains yet.
          </p>
        )}

        {domains.map((d) => (
          <article key={d.id} className={cardClass}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm font-medium text-gray-900">
                {d.domain}
              </span>
              <Badge tone="neutral">
                {d.type === "SUBDOMAIN" ? "Subdomain" : "Custom"}
              </Badge>
              <Badge tone={d.status === "VERIFIED" ? "success" : "warning"}>
                {d.status === "VERIFIED" ? "Verified" : "Pending"}
              </Badge>
              {d.primary && <Badge tone="info">Primary</Badge>}

              <span className="ml-auto flex items-center gap-4">
                {can.manage && d.status === "PENDING" && (
                  <Button
                    variant="link"
                    loading={busy === `verify-${d.id}`}
                    loadingText="Checking..."
                    onClick={() =>
                      void run(
                        `verify-${d.id}`,
                        `/api/v1/domains/${d.id}/verify`,
                        {
                          method: "POST",
                        },
                      )
                    }
                  >
                    Verify
                  </Button>
                )}
                {can.manage && d.status === "VERIFIED" && !d.primary && (
                  <Button
                    variant="link"
                    loading={busy === `primary-${d.id}`}
                    onClick={() =>
                      void run(`primary-${d.id}`, `/api/v1/domains/${d.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ primary: true }),
                      })
                    }
                  >
                    Make primary
                  </Button>
                )}
                {can.remove && (
                  <Button
                    variant="linkDanger"
                    loading={busy === `rm-${d.id}`}
                    onClick={() => remove(d)}
                  >
                    Remove
                  </Button>
                )}
              </span>
            </div>

            {d.verificationRecordName && d.verificationRecordValue && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs">
                <p className="mb-2 text-gray-600">
                  Add this DNS record at your DNS provider, then click Verify.
                  DNS changes can take a while to spread. Also point the domain
                  at this application so visitors can reach it.
                </p>
                <dl className="grid grid-cols-[4rem_1fr] gap-y-1">
                  <dt className="text-gray-500">Type</dt>
                  <dd>TXT</dd>
                  <dt className="text-gray-500">Name</dt>
                  <dd className="flex flex-wrap items-center gap-2 break-all font-mono">
                    {d.verificationRecordName}
                    <CopyButton value={d.verificationRecordName} />
                  </dd>
                  <dt className="text-gray-500">Value</dt>
                  <dd className="flex flex-wrap items-center gap-2 break-all font-mono">
                    {d.verificationRecordValue}
                    <CopyButton value={d.verificationRecordValue} />
                  </dd>
                </dl>
                {d.lastCheckResult && (
                  <p className="mt-2 text-amber-700">
                    Last check: {d.lastCheckResult}
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
