import { Suspense } from "react";
import { AccountForm } from "@/feature/settings/account-form";
import { PasswordForm } from "@/feature/settings/password-form";
import { authedFetch } from "@/lib/api";
import { loadOrRedirect } from "@/lib/server/load";
import type { AccountSettings } from "@/lib/settings";
import { timezones } from "@/lib/settings-options";

async function AccountContent() {
  const settings = await loadOrRedirect(() =>
    authedFetch<AccountSettings>("/api/v1/auth/me/settings"),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <AccountForm settings={settings} timezones={timezones()} />
      <PasswordForm />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
      <AccountContent />
    </Suspense>
  );
}