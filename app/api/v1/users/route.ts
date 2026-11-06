import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { CreateUserSchema } from "@/lib/server/schema/user-schema";
import { withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const POST = withValidOriginAndJson(async (_request, body) => {
  const parsed = CreateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please check the user fields." },
      { status: 400 },
    );
  }

  try {
    const created = await authedFetch("/api/v1/identity/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return errorResponse(err, "Unable to create the user.", {
      409: "A user with this email already exists.",
    });
  }
});
