import { SystemRole } from "@prisma/client"
import NextAuth, { DefaultSession } from "next-auth"

declare module "@auth/core/adapters" {
  interface AdapterUser {
    systemRole: SystemRole
  }
}

declare module "next-auth" {
  interface User {
    id: string
    systemRole: SystemRole
  }
  interface Session {
    user: {
      id: string
      systemRole: SystemRole
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    systemRole: SystemRole
  }
}