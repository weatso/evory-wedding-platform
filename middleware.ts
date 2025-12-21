// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth"; // Sesuaikan path ini dengan lokasi file auth.ts Anda

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role; // Pastikan auth.ts mengembalikan role

  // 1. Definisikan Route
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isClientRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = nextUrl.pathname.startsWith("/login");
  const isPublicRoute = 
    nextUrl.pathname.startsWith("/invitation") || 
    nextUrl.pathname === "/";

  // 2. Logic Redirect
  
  // Jika User sedang di halaman Login tapi sudah login -> lempar ke Dashboard
  if (isAuthRoute && isLoggedIn) {
    if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Jika User bukan Admin tapi coba akses /admin
  if (isAdminRoute) {
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "ADMIN") {
        // Jika Client iseng coba buka /admin, lempar balik ke dashboard
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // Jika User belum login coba akses /dashboard
  if (isClientRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

// Matcher: Tentukan route mana saja yang kena middleware
export const config = {
  matcher: [
    // Skip file statis (_next, images, favicon)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};