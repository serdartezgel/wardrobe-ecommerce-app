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
  const isDashboard = pathname.startsWith("/dashboard");

  const superAdminRoutes = ["/dashboard/users", "/dashboard/settings"];
  const isSuperAdminRoute = superAdminRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!session && (isAccountPage || isDashboard)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isSuperAdminRoute && session?.user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboard) {
    if (
      session?.user.role !== "ADMIN" &&
      session?.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
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
    "/dashboard/:path*",
  ],
};
