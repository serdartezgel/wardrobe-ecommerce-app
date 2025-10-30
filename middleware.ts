import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password");
  const isAccountPage = pathname.startsWith("/account");
  const isAdminPage = pathname.startsWith("/admin");

  if (!session && isAccountPage) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!session && isAdminPage) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/sign-in/:path*",
    "/sign-up/:path*",
    "/forgot-password/:path*",
    "/account/:path*",
    "/admin/:path*",
  ],
};
