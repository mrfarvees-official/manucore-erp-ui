import { NextResponse } from "next/server";
import { z } from "zod";
import { backendFetch } from "@/lib/api";
import { hostFromRequest } from "@/lib/server/host";
import { withValidOriginAndJson } from "@/lib/server/security";
import { request } from "http";

const LoginSchema = z.object({
  email: z.string().trim().email().max(245),
  password: z.string().min(1).max(128),
});

type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
};

export const POST = withValidOriginAndJson(async (request, body) => {
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please enter a valid email and password." },
      { status: 400 },
    );
  }

  let auth: LoginResponse;

  try {
    auth = await backendFetch<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...parsed.data, 
        host: hostFromRequest(request),
      }),
    });
  } catch (err) {
    const status = (err as { status?: number })?.status;

    if (status === 401) {
      return NextResponse.json(
        { message: "Incorrect email or password." },
        { status: 401 },
      );
    }

    console.error("Login backend call failed:", err);

    return NextResponse.json(
      { message: "Unable to sign in. Please try again." },
      { status: 502 },
    );
  }

  if (
    typeof auth?.accessToken !== "string" ||
    !auth.accessToken ||
    !Number.isFinite(auth.expiresInSeconds) ||
    auth.expiresInSeconds <= 0
  ) {
    return NextResponse.json(
      { message: "Invalid authentication response." },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("mc_access", auth.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: auth.expiresInSeconds,
  });

  return response;
});
