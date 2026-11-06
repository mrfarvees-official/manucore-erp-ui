import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { AccountSettingsSchema } from "@/lib/server/schema/settings-schema";
import { withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const PUT = withValidOriginAndJson(async (_request, body) => {
  const parsed = AccountSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please check the fields." },
      { status: 400 },
    );
  }

  try {
    const updated = await authedFetch("/api/v1/auth/me/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err, "Unable to save your settings.");
  }
});
