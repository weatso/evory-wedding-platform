// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth" // Import dari file auth.ts di root tadi
export const { GET, POST } = handlers