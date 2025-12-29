import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      // UPDATE: Tambahkan "USHER" di sini agar TypeScript tidak error
      role: "ADMIN" | "CLIENT" | "USHER" | string 
    } & DefaultSession["user"]
  }

  interface User {
    role: "ADMIN" | "CLIENT" | "USHER" | string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "ADMIN" | "CLIENT" | "USHER" | string
  }
}