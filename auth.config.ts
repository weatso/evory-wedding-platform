import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnUsher = nextUrl.pathname.startsWith("/usher");
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnAdmin) {
        if (!isLoggedIn || userRole !== "ADMIN") return false;
        return true;
      }

      if (isOnUsher) {
        if (!isLoggedIn || (userRole !== "USHER" && userRole !== "ADMIN")) return false;
        return true;
      }

      if (isOnDashboard) {
        if (!isLoggedIn) return false;
        return true;
      }

      if (isOnLogin && isLoggedIn) {
          if (userRole === "ADMIN") return Response.redirect(new URL("/admin", nextUrl));
          if (userRole === "USHER") return Response.redirect(new URL("/usher", nextUrl));
          return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; 
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // FIX ERROR: Tambahkan Casting 'as ...'
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;