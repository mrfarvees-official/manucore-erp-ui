import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { uuidFromPath } from "@/lib/server/schema/ids";
import { UpdateItemSchema } from "@/lib/server/schema/item-schema";
import { withValidOrigin, withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";
import { success } from "zod";

export const PUT = withValidOriginAndJson(async (request, body) => {
  const id = uuidFromPath(request.nextUrl.pathname);
  const parsed = UpdateItemSchema.safeParse(body);

  if (!id || !parsed.success)
    return NextResponse.json(
      { message: "Please check the item fields." },
      { status: 400 },
    );

  try {
    const updated = await authedFetch(`/api/v1/inventory/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err, "Unabled to save the item.", {
      404: "This item no longer exists.",
      409: "The item was changed by someone else. Reload and try again.",
    });
  }
});

export const DELETE = withValidOrigin(async (request) => {
  const id = uuidFromPath(request.nextUrl.pathname);

  if (!id)
    return NextResponse.json({ message: "Invalid item id." }, { status: 400 });

  try {
    await authedFetch(`/api/v1/inventory/items/${id}`, {
      method: "DELETE",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Unable to delete the item.", {
      404: "This item no longer exists.",
    });
  }
});
