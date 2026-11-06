import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { uuidFromPath } from "@/lib/server/schema/ids";
import { withValidOrigin } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const POST = withValidOrigin(async (request) => {
  // The path is /api/domains/<id>/verify, so the id is one segment from the end.
  const id = uuidFromPath(request.nextUrl.pathname, 1);

  if (!id) {
    return NextResponse.json(
      { message: "Invalid domain id." },
      { status: 400 },
    );
  }

  try {
    const checked = await authedFetch(`/api/v1/identity/domains/${id}/verify`, {
      method: "POST",
    });

    return NextResponse.json(checked);
  } catch (err) {
    return errorResponse(err, "Unable to check the domain.", {
      404: "This domain no longer exists.",
    });
  }
});
