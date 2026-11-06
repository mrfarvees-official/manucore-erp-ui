import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "@/feature/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { hostFromHeaders } from "@/lib/server/host";
import { resolveTenantByHost } from "@/lib/server/loads/tenant-by-host";

async function RedirectIfAuthenticated() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return null;
}

function Heading({ name }: { name: string }) {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">Sign in to {name}</h1>
      <p className="mt-2 mb-8 text-sm text-gray-600">
        Enter your account details to continue.
      </p>
    </>
  );
}

async function TenantHeading() {
  const host = await hostFromHeaders();
  const tenant = host ? await resolveTenantByHost(host) : null;

  return <Heading name={tenant?.tenantName ?? "ManuCore"} />;
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfAuthenticated />
      </Suspense>
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
        <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <Suspense fallback={<Heading name="ManuCore" />}>
            <TenantHeading />
          </Suspense>

          <LoginForm />
        </section>
      </main>
    </>
  );
}