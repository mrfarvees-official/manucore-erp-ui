import "server-only";

import { notFound, redirect } from "next/navigation";

export async function loadOrRedirect<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (err) {
    const status = (err as { status?: number })?.status;

    if (status === 401) redirect("/login");
    if (status === 403 || status === 404) notFound();

    throw err;
  }
}
