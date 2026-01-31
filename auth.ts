import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import { authConfig } from "./auth.config"

export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  // [FIX] Tambahkan 'as any' di sini untuk bypass error tipe 'role'
  adapter: PrismaAdapter(prisma) as any, 
  session: { strategy: "jwt" },
  ...authConfig,
})