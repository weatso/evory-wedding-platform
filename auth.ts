import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { authConfig } from "./auth.config"

export const { 
  handlers: { GET, POST }, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  // FIX ERROR: Gunakan 'as any' untuk bypass cek versi strict TypeScript
  // karena secara fungsional ini kompatibel.
  adapter: PrismaAdapter(prisma) as any, 
  session: { strategy: "jwt" },
  ...authConfig,
})