import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// PENTING: Kita panggil NextAuth hanya menggunakan authConfig yang ringan
// Jangan pernah mengimpor ./auth.ts ke dalam middleware!
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;

  // 1. Definisikan Route
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isUsherRoute = nextUrl.pathname.startsWith("/usher");
  const isClientRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = nextUrl.pathname.startsWith("/login");

  // 2. Logic Redirect Terpusat
  if (isAuthRoute && isLoggedIn) {
    if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin", nextUrl));
    if (userRole === "USHER") return NextResponse.redirect(new URL("/usher", nextUrl));
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isAdminRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userRole !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isUsherRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userRole !== "ADMIN" && userRole !== "USHER") return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isClientRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Lindungi matcher agar tidak memblokir file statis dan API internal
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};