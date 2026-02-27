import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google"; // <--- TAMBAHKAN INI
import bcrypt from "bcryptjs";

export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  adapter: PrismaAdapter(prisma) as any, 
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    // 1. PROVIDER GOOGLE (Untuk Super Admin & Partner WO)
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Anda bisa menambahkan logic profile() di sini nanti jika ingin menarik avatar Google
    }),

    // 2. PROVIDER CREDENTIALS (Untuk Client & Usher yang dibuatkan oleh Partner)
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;
        
        const user = await prisma.user.findUnique({ where: { email } });
        // Jika tidak ada user ATAU user tersebut tidak punya password (berarti dia login via Google), tolak!
        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (passwordsMatch) return user;
        
        return null;
      },
    }),
  ],
})