import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { uuidFromPath } from "@/lib/server/schema/ids";
import { AdjustStockSchema } from "@/lib/server/schema/item-schema";
import { withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const POST = withValidOriginAndJson(async (request, body) => {
  // path is /api/v1/items/<id>/adjust, so the id is the second-to-last segment
  const id = uuidFromPath(request.nextUrl.pathname, 1);
  const parsed = AdjustStockSchema.safeParse(body);

  if (!id)
    return NextResponse.json({ message: "Invalid item." }, { status: 400 });

  if (!parsed.success)
    return NextResponse.json(
      { message: "Enter a non-zero amount." },
      { status: 400 },
    );

  try {
    const updated = await authedFetch(`/api/v1/inventory/items/${id}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err, "Unable to adjust the stock.", {
      404: "This item no longer exists.",
      409: "Not enough stock, or the item was just changed. Reload and try again.",
    });
  }
});
