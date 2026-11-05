import type { CurrentUser } from "@/lib/auth/session";

export function can(user: CurrentUser, permission: string): boolean {
    if (user.roles.includes("ADMIN")) {
        return true;
    }

    return user.permissions?.allowed.includes(permission) === true;
}