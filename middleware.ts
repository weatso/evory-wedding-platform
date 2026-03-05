import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

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
    if (userRole === "ADMIN" || userRole === "PARTNER") return NextResponse.redirect(new URL("/admin", nextUrl));
    if (userRole === "USHER") return NextResponse.redirect(new URL("/usher", nextUrl));
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 3. Karantina Wilayah Admin & Partner
  if (isAdminRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    // Jika Client atau Usher mencoba masuk /admin, tendang!
    if (userRole === "CLIENT") return NextResponse.redirect(new URL("/dashboard", nextUrl));
    if (userRole === "USHER") return NextResponse.redirect(new URL("/usher", nextUrl));
    
    // PERTAHANAN ABSOLUT: Partner tidak boleh masuk ke manajemen template pusat
    if (userRole === "PARTNER" && nextUrl.pathname.startsWith("/admin/templates")) {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
  }

  // 4. Karantina Wilayah Usher
  if (isUsherRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userRole === "CLIENT") return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 5. Karantina Wilayah Client
  if (isClientRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    if (userRole === "USHER") return NextResponse.redirect(new URL("/usher", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};