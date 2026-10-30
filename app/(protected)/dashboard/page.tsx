import { LogoutButton } from "@/feature/auth/logout-button";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardPage() {
    const user = await requireUser();

    return (
        <main className="min-h-screen bg-white px-6 py-12 text-gray-900">
            <div className="max-auto max-w-5xl">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="mt-3 text-gray-600">
                    Welcome back, {user.name}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                    {user.email}
                </p>
                <LogoutButton />
            </div>
        </main>
    );
}