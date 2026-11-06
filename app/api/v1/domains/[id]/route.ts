import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { uuidFromPath } from "@/lib/server/schema/ids";
import { PrimaryDomainSchema } from "@/lib/server/schema/settings-schema";
import { withValidOrigin, withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const PUT = withValidOriginAndJson(async (request, body) => {
  const id = uuidFromPath(request.nextUrl.pathname);
  const parsed = PrimaryDomainSchema.safeParse(body);

  if (!id || !parsed.success) {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  try {
    const updated = await authedFetch(`/api/v1/identity/domains/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ primary: true }),
    });

    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err, "Unable to change the primary domain.", {
      409: "Only verified domains can be primary.",
    });
  }
});

export const DELETE = withValidOrigin(async (request) => {
  const id = uuidFromPath(request.nextUrl.pathname);

  if (!id) {
    return NextResponse.json(
      { message: "Invalid domain id." },
      { status: 400 },
    );
  }

  try {
    await authedFetch(`/api/v1/identity/domains/${id}`, { method: "DELETE" });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Unable to remove the domain.", {
      404: "This domain no longer exists.",
    });
  }
});
