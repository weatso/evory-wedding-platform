'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from "@/lib/db"; // <-- Pastikan import Prisma

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // --- LOGIKA BARU MULAI ---
    
    // 1. Cek User & Role di Database dulu
    const user = await prisma.user.findUnique({
        where: { email },
        select: { role: true }
    });

    // 2. Tentukan Tujuan (Redirect) berdasarkan Role
    let destination = "/dashboard"; // Default untuk CLIENT

    if (user?.role === "ADMIN") {
        destination = "/admin";
    } else if (user?.role === "USHER") {
        destination = "/usher"; // <-- Usher langsung ke sini
    }

    // 3. Login dengan tujuan yang sudah ditentukan
    await signIn('credentials', {
        email,
        password,
        redirectTo: destination, // Kuncinya ada di sini
    });

    // --- LOGIKA BARU SELESAI ---

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Password atau Email salah.';
        default:
          return 'Terjadi kesalahan sistem.';
      }
    }
    throw error;
  }
}