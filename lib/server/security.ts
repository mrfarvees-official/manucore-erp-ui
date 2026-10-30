
import { NextRequest, NextResponse } from "next/server";

type RouteHandler = (
  request: NextRequest,
) => Promise<NextResponse>;

type JsonHandler = (
  request: NextRequest,
  body: unknown,
) => Promise<NextResponse>;

function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return !!origin && origin === request.nextUrl.origin;
}

export function withValidOrigin(handler: RouteHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (!isValidOrigin(request)) {
      return NextResponse.json(
        { message: "Invalid request origin" },
        { status: 403 },
      );
    }

    return handler(request);
  };
}

export function withValidOriginAndJson(handler: JsonHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    if (!isValidOrigin(request)) {
      return NextResponse.json(
        { message: "Invalid request origin" },
        { status: 403 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }

    return handler(request, body);
  };
}
