import "server-only";

import { headers } from "next/headers";
import type { NextRequest } from "next/server";

function pickHost(read: (name: string) => string | null): string | null {
  const forwarded =
    process.env.TRUST_FORWARDED_HOST === "true"
      ? read("x-forwarded-host")
      : null;
  const raw = (forwarded ?? read("host"))?.split(",")[0].trim().toLowerCase();

  return raw || null;
}

export function hostFromRequest(request: NextRequest) {
  return pickHost((name) => request.headers.get(name));
}

export async function hostFromHeaders() {
  const incoming = await headers();

  return pickHost((name) => incoming.get(name));
}
