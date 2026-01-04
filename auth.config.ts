import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // 1. LOGIKA MIDDLEWARE (SATPOL PP)
    // Menentukan siapa boleh masuk ke mana sebelum halaman dirender
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnUsher = nextUrl.pathname.startsWith("/usher");
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      // A. PROTEKSI WILAYAH ADMIN
      if (isOnAdmin) {
        if (!isLoggedIn) return false; 
        
        // Kembalikan ke aturan ketat: Hanya Admin boleh masuk /admin
        if (userRole !== "ADMIN") {
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // B. PROTEKSI WILAYAH USHER
      if (isOnUsher) {
        if (!isLoggedIn) return false;
        
        // Admin juga boleh intip dashboard usher buat monitoring
        if (userRole !== "USHER" && userRole !== "ADMIN") {
             return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // C. PROTEKSI WILAYAH DASHBOARD (CLIENT)
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect ke login jika belum auth
      }

      // D. JIKA SUDAH LOGIN TAPI BUKA HALAMAN LOGIN
      if (isOnLogin && isLoggedIn) {
          if (userRole === "ADMIN") return Response.redirect(new URL("/admin", nextUrl));
          if (userRole === "USHER") return Response.redirect(new URL("/usher", nextUrl));
          return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },

    // 2. LOGIKA TOKEN (Menyimpan Role ke dalam Token)
    jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.id = user.id;
      }
      return token;
    },

    // 3. LOGIKA SESSION (Menyalin Role dari Token ke Session agar bisa dibaca di frontend)
    session({ session, token }) {
      if (token && session.user) {
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    },
  },
  providers: [], // Providers didefinisikan di auth.ts
} satisfies NextAuthConfig;