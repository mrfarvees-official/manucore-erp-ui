import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { PolicyInputSchema } from "@/lib/server/schema/policy-schema";
import { withValidOrigin, withValidOriginAndJson } from "@/lib/server/security";
import { NextRequest, NextResponse } from "next/server";
import z, { success } from "zod";

function policyId(request: NextRequest): string | null {
  const last = request.nextUrl.pathname.split("/").filter(Boolean).pop();
  const parsed = z.uuid().safeParse(last);

  return parsed.success ? parsed.data : null;
}

export const PUT = withValidOriginAndJson(async (request, body) => {
  const id = policyId(request);
  const parsed = PolicyInputSchema.safeParse(body);

  if (!id || !parsed.success)
    return NextResponse.json(
      { message: "Please check the policy fields." },
      { status: 400 },
    );

  try {
    const updated = await authedFetch(`/api/v1/authorization/policies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err, "Unable to save the policy.");
  }
});

export const DELETE = withValidOrigin(async (request) => {
  const id = policyId(request);

  if (!id)
    return NextResponse.json(
      { message: "Invalid policy id." },
      { status: 400 },
    );

  try {
    await authedFetch(`/api/v1/authorization/policies/${id}`, {
      method: "DELETE",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Unable to delete the policy.");
  }
});
