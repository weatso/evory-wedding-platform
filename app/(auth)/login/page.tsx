// app/(auth)/login/page.tsx
'use client';
 
import { useActionState } from 'react';
import { authenticate } from '@/lib/actions'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from "next/link";       // <-- Tambahan Import
import { ArrowLeft } from "lucide-react"; // <-- Tambahan Import
 
export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );
 
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 relative">
      
      {/* --- TAMBAHAN TOMBOL KEMBALI DI SINI --- */}
      <div className="absolute top-6 left-6">
        <Link href="/">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 gap-2">
                <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
        </Link>
      </div>
      {/* --------------------------------------- */}

      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Masuk ke Platform</h1>
          <p className="text-sm text-slate-500 mt-1">Vendor & Client Login</p>
        </div>
        
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              name="email" 
              placeholder="nama@email.com" 
              required 
              className="bg-slate-50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              name="password" 
              required 
              className="bg-slate-50"
            />
          </div>

          <Button className="w-full bg-slate-900 hover:bg-slate-800" disabled={isPending}>
            {isPending ? 'Sedang Memproses...' : 'Masuk'}
          </Button>

          {/* Menampilkan Error State */}
          {errorMessage && (
            <div className="p-3 rounded bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </div>
          )}
        </form>

        <div className="text-center text-xs text-slate-400">
          Wedding Platform &copy; 2025
        </div>
      </div>
    </div>
  );
}