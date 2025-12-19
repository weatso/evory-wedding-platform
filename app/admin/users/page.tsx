// app/admin/users/page.tsx
'use client' // WAJIB TAMBAH INI

import { useActionState } from "react"; // Import dari React langsung (Next.js 15)
import { addUser } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminAddUserPage() {
  // Hook untuk menangani state form dan loading
  const [state, formAction, isPending] = useActionState(addUser, null);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tambah Client Baru</h1>
      
      {/* Tampilkan Error jika ada */}
      {state?.message && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-bold border border-red-200">
            ⚠️ {state.message}
        </div>
      )}

      {/* Ganti action menjadi formAction */}
      <form action={formAction} className="space-y-4 border p-6 rounded-lg bg-white">
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>Nama Client (Pemilik Akun)</Label>
                <Input name="name" placeholder="Misal: Romeo Montague" required />
            </div>
            <div>
                <Label>Role</Label>
                <select name="role" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                    <option value="CLIENT">Client (Mempelai)</option>
                    <option value="ADMIN">Admin / Staff</option>
                </select>
            </div>
        </div>

        <div>
            <Label>Email Login</Label>
            <Input name="email" type="email" required />
        </div>

        <div>
            <Label>Password Awal</Label>
            <Input name="password" type="text" placeholder="Misal: wedding123" required />
            <p className="text-xs text-slate-500 mt-1">Berikan password ini ke klien via WhatsApp.</p>
        </div>

        <hr className="my-4"/>
        <p className="font-bold text-sm text-slate-700">Data Undangan (Otomatis Dibuat)</p>

        <div className="grid grid-cols-2 gap-4">
             <Input name="groomName" placeholder="Nama Pria" required />
             <Input name="brideName" placeholder="Nama Wanita" required />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
             <Input name="slug" placeholder="Slug URL (misal: romeo-juliet)" required />
             <Input name="eventDate" type="datetime-local" required />
        </div>

        {/* Tombol bisa disabled saat loading */}
        <Button type="submit" className="w-full bg-slate-900 text-white" disabled={isPending}>
            {isPending ? "Sedang Menyimpan..." : "Simpan Client & Buat Undangan"}
        </Button>
      </form>
    </div>
  );
}