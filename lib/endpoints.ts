type API = {
    ROUTE: string;
    HEADERS: object;
}

export const endpoints = {
    AUTH: {
        ROUTE: "/api/v1/auth/login",
        HEADERS: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }
    }
} satisfies Record<string, API>;