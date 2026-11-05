import { Suspense } from "react";
import { LogoutButton } from "@/feature/auth/logout-button";
import Sidebar from "@/feature/navigation/sidebar";
import { requireUser } from "@/lib/auth/session";
import { getNavigation } from "@/lib/navigation";

async function AuthGate({ children }: Readonly<{ children: React.ReactNode }>) {
    const user = await requireUser();

    return (
        <div className="min-h-screen bg-gray-50 lg:flex">
            <Sidebar
                groups={getNavigation(user)}
                user={{ name: user.name, email: user.email }}
                footer={<LogoutButton />}
            />
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}

export default function ProtectedLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <Suspense fallback={null}>
            <AuthGate>{children}</AuthGate>
        </Suspense>
    );
}