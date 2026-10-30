import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import LoginForm from "@/feature/auth/login-form";

async function RedirectIfAuthenticated() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return null;
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfAuthenticated />
      </Suspense>
      <LoginContent />
    </>
  );
}

function LoginContent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Sign in to ManuCore
        </h1>

        <p className="mt-2 mb-8 text-sm text-gray-600">
          Enter your account details to continue.
        </p>

        <LoginForm />
      </section>
    </main>
  );
}