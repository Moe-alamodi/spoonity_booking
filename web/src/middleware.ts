import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Example: add security headers or domain checks here if needed
  return NextResponse.next();
}

export const config = {
  matcher: ["/plan", "/admin/:path*", "/participants/:path*", "/api/:path*"],
};

