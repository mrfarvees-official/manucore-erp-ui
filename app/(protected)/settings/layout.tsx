import { Suspense } from "react";
import { SettingsTabs } from "@/feature/settings/settings-tabs";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";

async function SettingsFrame({ children }: { children: React.ReactNode }) {
  const me = await requireUser();

  const tabs = [
    { label: "My account", href: "/settings" },
    ...(can(me, "IDENTITY.TENANT:READ")
      ? [{ label: "Company", href: "/settings/company" }]
      : []),
    ...(can(me, "IDENTITY.DOMAINS:READ")
      ? [{ label: "Domains", href: "/settings/domains" }]
      : []),
  ];

  return (
    <main className="mx-auto max-w-8xl px-6 py-8 text-gray-900">
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      <SettingsTabs tabs={tabs} />
      <div className="mt-6">{children}</div>
    </main>
  );
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<p className="p-8 text-gray-400">Loading...</p>}>
      <SettingsFrame>{children}</SettingsFrame>
    </Suspense>
  );
}
