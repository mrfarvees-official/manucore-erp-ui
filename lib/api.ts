import "server-only";

const API_URL = process.env.SPRING_BOOT_API_URL;

if (!API_URL) {
  throw new Error("SPRING_BOOT_API_URL is not configured");
}

export async function backendFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
    cache: "no-store",
    redirect: "manual",
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}