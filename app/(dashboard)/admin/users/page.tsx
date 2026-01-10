'use client'

import { useActionState } from "react";
import { addUser, ActionState } from "./actions"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";            // <-- Tambahan Import
import { ArrowLeft } from "lucide-react"; // <-- Tambahan Import Icon

// Initial State kosong
const initialState: ActionState = {
    message: null,
    errors: {},
    success: false
}

export default function AdminAddUserPage() {
  const [state, formAction, isPending] = useActionState(addUser, initialState);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 relative font-sans">
      
      {/* --- TOMBOL KEMBALI (FIX) --- */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6">
        <Link href="/admin">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 gap-2">
                <ArrowLeft className="w-4 h-4" /> 
                <span className="hidden md:inline">Kembali ke Admin</span>
                <span className="md:hidden">Kembali</span>
            </Button>
        </Link>
      </div>
      {/* --------------------------- */}

      <div className="max-w-2xl mx-auto mt-8 md:mt-0">
          <div className="text-center mb-8">
             <h1 className="text-3xl font-bold text-slate-900">Tambah Client Baru</h1>
             <p className="text-slate-500 mt-2">Buat akun login sekaligus project undangan awal.</p>
          </div>
          
          {/* Alert Global Message */}
          {state.message && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-bold border flex items-center gap-2 ${state.success ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                <span>{state.success ? '✅ ' : '⚠️ '}</span>
                {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-6 border border-slate-200 p-6 md:p-8 rounded-xl bg-white shadow-sm">
            
            {/* DATA AKUN LOGIN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Nama Client (User)</Label>
                    <Input name="name" placeholder="Romeo Montague" required />
                    {state.errors?.name && <p className="text-red-500 text-xs">{state.errors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Role</Label>
                    <select name="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="CLIENT">Client (Mempelai)</option>
                        <option value="ADMIN">Admin / Staff</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Email Login</Label>
                <Input name="email" type="email" placeholder="client@email.com" required />
                {state.errors?.email && <p className="text-red-500 text-xs">{state.errors.email[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label>Password Awal</Label>
                <Input name="password" type="text" placeholder="min. 6 karakter" required />
                <p className="text-xs text-slate-400">Info ini wajib dicatat & diberikan ke klien.</p>
                {state.errors?.password && <p className="text-red-500 text-xs">{state.errors.password[0]}</p>}
            </div>

            {/* DATA UNDANGAN AWAL */}
            <div className="border-t border-slate-100 pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
                    <p className="font-bold text-sm text-slate-900 uppercase tracking-wider">Setup Undangan Awal</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div className="space-y-2">
                        <Label>Nama Pria</Label>
                        <Input name="groomName" required />
                        {state.errors?.groomName && <p className="text-red-500 text-xs">{state.errors.groomName[0]}</p>}
                     </div>
                     <div className="space-y-2">
                        <Label>Nama Wanita</Label>
                        <Input name="brideName" required />
                        {state.errors?.brideName && <p className="text-red-500 text-xs">{state.errors.brideName[0]}</p>}
                     </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Slug URL (Unik)</Label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">/</span>
                            <Input name="slug" placeholder="romeo-juliet" className="rounded-l-none" required />
                        </div>
                        {state.errors?.slug && <p className="text-red-500 text-xs">{state.errors.slug[0]}</p>}
                     </div>
                     <div className="space-y-2">
                        <Label>Tanggal Acara</Label>
                        <Input name="eventDate" type="datetime-local" required />
                        {state.errors?.eventDate && <p className="text-red-500 text-xs">{state.errors.eventDate[0]}</p>}
                     </div>
                </div>
            </div>

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 mt-6 shadow-lg" disabled={isPending}>
                {isPending ? "Sedang Memproses..." : "Simpan & Buat Undangan"}
            </Button>
          </form>
      </div>
    </div>
  );
}