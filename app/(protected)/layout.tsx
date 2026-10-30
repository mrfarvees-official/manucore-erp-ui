import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";

export const instant = false;

async function AuthGate({ children }: Readonly<{ children: React.ReactNode }>) {
    await requireUser();

    return <>{children}</>;
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
