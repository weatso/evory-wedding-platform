import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [], 
  callbacks: {
    authorized({ auth }) {
      return true; 
    },
    async jwt({ token, user }) {
      if (user) {
        token.systemRole = (user as any).systemRole; // PERBAIKAN: Gunakan systemRole
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.systemRole = token.systemRole as any; // PERBAIKAN: Gunakan systemRole
      }
      return session;
    },
  },
} satisfies NextAuthConfig;