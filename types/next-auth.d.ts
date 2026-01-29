import { UserRole } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

// 1. Perluas type User (agar 'user.role' dikenali di jwt callback)
declare module "next-auth" {
  interface User {
    role: UserRole
  }

  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession["user"]
  }
}

// 2. Perluas type JWT
declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    id: string
  }
}