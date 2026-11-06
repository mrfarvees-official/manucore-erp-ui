import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { PolicyInputSchema } from "@/lib/server/schema/policy-schema";
import { withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const POST = withValidOriginAndJson(async (_request, body) => {
  const parsed = PolicyInputSchema.safeParse(body);

  if (!parsed.success)
    return NextResponse.json(
      { message: "Please check the policy fields." },
      { status: 400 },
    );

  try {
    const created = await authedFetch("/api/v1/authorization/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return errorResponse(err, "Unable to save the policy");
  }
});
