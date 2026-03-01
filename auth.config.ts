import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Providers dikosongkan di sini, karena bcrypt/Prisma tidak bisa masuk Edge.
  // Kita injeksikan mereka nanti di auth.ts
  providers: [], 
  callbacks: {
    // Kita pindahkan logic otorisasi rute sepenuhnya ke middleware.ts 
    // agar file ini hanya mengurus manipulasi Token JWT.
    authorized({ auth }) {
      return true; 
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role; 
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;