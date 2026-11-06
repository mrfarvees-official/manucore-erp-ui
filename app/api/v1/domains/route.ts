import { authedFetch } from "@/lib/api";
import { errorResponse } from "@/lib/server/errors";
import { AddDomainSchema } from "@/lib/server/schema/settings-schema";
import { withValidOriginAndJson } from "@/lib/server/security";
import { NextResponse } from "next/server";

export const POST = withValidOriginAndJson(async (_request, body) => {
  const parsed = AddDomainSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Enter a domain name, for example erp.example.com." },
      { status: 400 },
    );
  }

  try {
    const created = await authedFetch("/api/v1/identity/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return errorResponse(err, "Unable to add the domain.", {
      400: "Enter only the domain name (no http:// or port). Platform subdomains must be a single name.",
      409: "That domain is already in use, or you have reached the limit of 10.",
    });
  }
});
