import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { message: "Invalid request origin" },
      { status: 403 },
    );
  }

  // The identity service issues stateless JWTs and has no logout/revocation
  // endpoint, so signing out only clears the session cookie.
  const response = NextResponse.json({ success: true });

  response.cookies.set("mc_access", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}