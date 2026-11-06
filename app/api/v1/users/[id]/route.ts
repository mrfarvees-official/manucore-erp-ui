import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { uuidFromPath } from "@/lib/server/schema/ids";
import { UpdateUserSchema } from "@/lib/server/schema/user-schema";
import { withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const PUT = withValidOriginAndJson(async (request, body) => {
  const id = uuidFromPath(request.nextUrl.pathname);
  const parsed = UpdateUserSchema.safeParse(body);

  if (!id || !parsed.success) {
    return NextResponse.json(
      { message: "Please check the user fields." },
      { status: 400 },
    );
  }

  try {
    const updated = await authedFetch(`/api/v1/identity/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err, "Unable to save the user.", {
      404: "This user no longer exists.",
      409: "Not allowed: you cannot deactivate yourself or remove your own ADMIN role, and at least one active administrator must remain.",
    });
  }
});
