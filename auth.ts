// auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: '/login', // Jika belum login, lempar ke sini
  },
  callbacks: {
    // Dipanggil saat sesi dibuat, kita selipkan role & id ke session
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        // @ts-ignore
        session.user.role = token.role; 
      }
      return session;
    },
    // Dipanggil saat JWT dibentuk
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    }
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          // Cek password hash
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            // Berhasil login, kembalikan data user (tanpa password)
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});