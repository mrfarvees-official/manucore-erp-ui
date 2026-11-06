import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { PasswordSchema } from "@/lib/server/schema/settings-schema";
import { withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const POST = withValidOriginAndJson(async (_request, body) => {
  const parsed = PasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "The new password must be 8 to 72 characters." },
      { status: 400 },
    );
  }

  try {
    await authedFetch("/api/v1/auth/me/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Unable to change the password.", {
      400: "The current password is incorrect, or the new password is not allowed.",
    });
  }
});
