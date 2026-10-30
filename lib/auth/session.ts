import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type CurrentUser = {
    id: string;
    email: string;
    name: string;
    roles: string[];
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("mc_access")?.value;

    if (!token) {
        return null;
    }

    try {
        const response = await fetch(
            `${process.env.SPRING_BOOT_API_URL}/api/v1/auth/me`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            return null;
        }

        return (await response.json()) as CurrentUser;
    } catch {
        return null;
    }
}

export async function requireUser(): Promise<CurrentUser> {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return user;
}