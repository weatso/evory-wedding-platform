// app/login/page.tsx
'use client';
 
import { useActionState } from 'react';
import { authenticate } from '@/lib/actions'; // Kita buat actions ini di langkah 5
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
 
export default function Page() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );
 
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <form action={formAction} className="space-y-4 w-full max-w-sm p-8 bg-white rounded-lg border shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Vendor Login</h1>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" name="email" placeholder="klien@example.com" required />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" name="password" required />
        </div>

        <Button className="w-full" disabled={isPending}>
          {isPending ? 'Memproses...' : 'Masuk'}
        </Button>

        {errorMessage && (
          <div className="text-red-500 text-sm text-center">{errorMessage}</div>
        )}
      </form>
    </div>
  );
}