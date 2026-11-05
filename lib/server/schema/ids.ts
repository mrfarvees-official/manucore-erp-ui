import z from "zod";

/** fromEnd = 0 is the last path segment, 1 is the one before it */
export function uuidFromPath(pathname: string, fromEnd = 0): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const parsed = z.uuid().safeParse(segments[segments.length - 1 - fromEnd]);

  return parsed.success ? parsed.data : null;
}
