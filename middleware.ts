import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.systemRole;

  // 1. Definisikan Route
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isWorkspaceRoute = nextUrl.pathname.startsWith("/workspace");
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = nextUrl.pathname.startsWith("/login");

  // 2. Logic Redirect Terpusat
  if (isAuthRoute && isLoggedIn) {
    if (userRole === "SUPERADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 3. Karantina Wilayah Admin
  if (isAdminRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userRole !== "SUPERADMIN") return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 4. Karantina Wilayah Workspace & Dashboard
  if (isWorkspaceRoute || isDashboardRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userRole === "WAITING") return NextResponse.redirect(new URL("/waiting-room", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};