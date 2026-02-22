import { UserRole } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

// 1. Memaksa Adapter untuk mengenali kolom kustom di database
declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: UserRole
    partnerId: string | null
  }
}

// 2. Memperluas tipe User & Session di aplikasi (Frontend/Backend)
declare module "next-auth" {
  interface User {
    id: string
    role: UserRole
    partnerId: string | null
  }
  interface Session {
    user: {
      id: string
      role: UserRole
      partnerId: string | null
    } & DefaultSession["user"]
  }
}

// 3. Memperluas tipe JWT untuk keamanan token
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    partnerId: string | null
  }
}