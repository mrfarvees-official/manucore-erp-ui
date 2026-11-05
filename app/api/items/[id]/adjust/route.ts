import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { uuidFromPath } from "@/lib/server/schema/ids";
import { AdjustStockSchema } from "@/lib/server/schema/item-schema";
import { withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const POST = withValidOriginAndJson(async (request, body) => {
  const id = uuidFromPath(request.nextUrl.pathname);
  const parsed = AdjustStockSchema.safeParse(body);

  if (!id || !parsed.success)
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
