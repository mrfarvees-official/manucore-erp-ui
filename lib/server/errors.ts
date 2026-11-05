import "server-only";

import { NextResponse } from "next/server";

const GENERIC = new Set([
  "Bad Request",
  "Conflict",
  "Not Found",
  "Forbidden",
  "Unauthorized",
  "Internal Server Error",
]);

function usable(value: unknown): string | undefined {
  return typeof value === "string" && value && !GENERIC.has(value)
    ? value
    : undefined;
}

export function errorResponse(err: unknown, fallback: string, overrides: Partial<Record<number, string>> = {}) {
  const { status, body } = err as { status?: number; body?: unknown };
  const data = (body ?? {}) as {
    message?: unknown;
    detail?: unknown;
    error?: unknown;
  };
  const detail =
    usable(data.message) ?? usable(data.detail) ?? usable(data.error);

  if (status === 400 || status === 404 || status === 409)
    return NextResponse.json({ message: detail ?? overrides[status] ?? fallback }, { status });

  if (status === 401)
    return NextResponse.json(
      { message: "Your session has expired. Please sign in again." },
      { status },
    );

  if (status === 403)
    return NextResponse.json(
      { message: "You are not permitted to do this." },
      { status },
    );

  console.error(fallback, err);
  return NextResponse.json({ message: fallback }, { status: 502 });
}
