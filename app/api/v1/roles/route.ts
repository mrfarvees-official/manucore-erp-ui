import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { CreateRoleSchema } from "@/lib/server/schema/role-schema";
import { withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const POST = withValidOriginAndJson(async (_request, body) => {
  const parsed = CreateRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please check the role fields." },
      { status: 400 },
    );
  }

  try {
    const created = await authedFetch("/api/v1/identity/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return errorResponse(err, "Unable to create the role.", {
      409: "A role with this name already exists.",
    });
  }
});
