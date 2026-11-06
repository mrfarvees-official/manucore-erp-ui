import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { uuidFromPath } from "@/lib/server/schema/ids";
import { UpdateRoleSchema } from "@/lib/server/schema/role-schema";
import { withValidOrigin, withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const PUT = withValidOriginAndJson(async (request, body) => {
  const id = uuidFromPath(request.nextUrl.pathname);
  const parsed = UpdateRoleSchema.safeParse(body);

  if (!id || !parsed.success) {
    return NextResponse.json(
      { message: "Please check the role fields." },
      { status: 400 },
    );
  }

  try {
    const updated = await authedFetch(`/api/v1/identity/roles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err, "Unable to save the role.", {
      404: "This role no longer exists.",
    });
  }
});

export const DELETE = withValidOrigin(async (request) => {
  const id = uuidFromPath(request.nextUrl.pathname);

  if (!id) {
    return NextResponse.json({ message: "Invalid role id." }, { status: 400 });
  }

  try {
    await authedFetch(`/api/v1/identity/roles/${id}`, { method: "DELETE" });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Unable to delete the role.", {
      404: "This role no longer exists.",
      409: "This role is built in or is still assigned to users.",
    });
  }
});
