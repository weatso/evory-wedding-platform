// lib/actions.ts
'use server'
 
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
 
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo: '/dashboard', // Default redirect, nanti middleware yang ngatur ulang
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email atau password salah.'
        default:
          return 'Terjadi kesalahan sistem.'
      }
    }
    throw error
  }
}