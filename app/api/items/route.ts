import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { CreateItemSchema } from "@/lib/server/schema/item-schema";
import { withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const POST = withValidOriginAndJson(async (_request, body) => {
  const parsed = CreateItemSchema.safeParse(body);

  if (!parsed)
    return NextResponse.json(
      { message: "Please check the item fields." },
      { status: 400 },
    );

  try {
    const created = await authedFetch("/api/v1/inventory/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return errorResponse(err, "Unable to create the item.", {
      409: "An item with this SKU already exists.",
    });
  }
});
