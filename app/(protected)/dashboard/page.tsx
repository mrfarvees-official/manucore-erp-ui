import { Suspense } from "react";
import { LogoutButton } from "@/feature/auth/logout-button";
import { requireUser } from "@/lib/auth/session";

async function UserWelcome() {
    const user = await requireUser();

    return (
        <>
            <p className="mt-3 text-gray-600">Welcome back, {user.name}</p>
            <p className="mt-2 text-sm text-gray-500">{user.email}</p>
        </>
    );
}

export default function DashboardPage() {
    return (
        <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
            <div className="mx-auto max-w-8xl">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Suspense
                    fallback={<p className="mt-3 text-gray-400">Loading...</p>}
                >
                    <UserWelcome />
                </Suspense>
            </div>
        </main>
    );
}
