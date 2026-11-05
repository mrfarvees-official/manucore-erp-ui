import "server-only";

import { cookies, headers } from "next/headers";

const API_URL: string = (() => {
  const url = process.env.SPRING_BOOT_API_URL;

  if (!url) {
    throw new Error("SPRING_BOOT_API_URL is not configured");
  }

  return url;
})();

/** Thrown for any non-2xx backend response, keeping the status and parsed body. */
export class BackendError extends Error {
  constructor(
    public status: number,
    public body?: unknown,
  ) {
    super(`Backend request failed: ${status}`);
  }
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const url = `${API_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

  const response = await fetch(url,{
      ...options,
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    }
  );

  if (!response.ok) {
    let body: unknown;

    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    throw new BackendError(response.status, body);
  }

  if (response.status === 204)
    return undefined as T;

  return response.json() as Promise<T>;
}

/** For call that need no login (the login request itself) */
export function backendFetch<T>(path: string, options: RequestInit = {}) {
  return request<T>(path, options);
}

/** For calls made on behalf of the singed-in user */
export async function authedFetch<T>(path: string, options: RequestInit = {}) {
  const token = (await cookies()).get("mc_access")?.value;

  if (!token)
    throw new BackendError(401);

  return request<T>(path, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}`},
  });
}