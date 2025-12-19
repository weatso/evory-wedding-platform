// middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;
  const isOnAdmin = req.nextUrl.pathname.startsWith('/admin');
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isOnLogin = req.nextUrl.pathname.startsWith('/login');

  // 1. Jika sudah login tapi buka halaman login, lempar ke dashboard
  if (isLoggedIn && isOnLogin) {
    if (userRole === 'DEVELOPER' || userRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 2. Proteksi Halaman Admin
  if (isOnAdmin) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.url));
    if (userRole !== 'DEVELOPER' && userRole !== 'ADMIN') {
        // Klien nakal coba masuk admin -> tendang ke dashboard biasa
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // 3. Proteksi Halaman Dashboard Client
  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
})

// Matcher: Tentukan route mana yang kena efek middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}