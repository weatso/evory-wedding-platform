'use client';

import { useState } from "react";
import { addStaff } from "../actions"; // Pastikan action ini bisa membaca semua role yang dilempar
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Loader2 } from "lucide-react";

// Definisikan Props agar TypeScript mengerti data apa yang mengalir masuk
type Props = {
  roleOptions: string[];
  partnerId?: string;
};

// GANTI MENJADI DEFAULT EXPORT AGAR SESUAI DENGAN PAGE.TSX
export default function AddStaffModal({ roleOptions, partnerId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    
    const res = await addStaff(formData);
    
    setLoading(false);

    if (res?.error) {
        alert(res.error); // Anda bisa menggantinya dengan sonner/toast nanti
    } else {
        setOpen(false); 
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#07303F] text-[#F9F8F4] hover:bg-[#0a455a] font-bold uppercase tracking-widest text-[10px] h-12 px-6 rounded-sm transition-all shadow-lg shadow-[#07303F]/20">
            <UserPlus className="w-4 h-4 mr-2 text-[#E5C185]"/> Tambah Entitas
        </Button>
      </DialogTrigger>
      
      {/* DESAIN MODAL PREMIUM (Ivory & Navy) */}
      <DialogContent className="sm:max-w-[425px] bg-[#F9F8F4] border-slate-200 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif italic text-[#07303F]">Otorisasi Akses Baru</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Berikan kredensial login kepada partner, klien, atau staff ke dalam sistem The Vault.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleSubmit} className="grid gap-5 py-4">
          
          {/* INJEKSI PARTNER ID SECARA GAIB (HIDDEN) */}
          {partnerId && (
              <input type="hidden" name="partnerId" value={partnerId} />
          )}

          <div className="grid gap-2">
            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Entitas / Klien</Label>
            <Input id="name" name="name" required placeholder="Contoh: Radeva Organizer" className="bg-white border-slate-200 focus-visible:ring-[#E5C185] h-12 rounded-sm" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Alamat Email (Login)</Label>
            <Input id="email" name="email" type="email" required placeholder="akses@domain.com" className="bg-white border-slate-200 focus-visible:ring-[#E5C185] h-12 rounded-sm" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tingkat Otoritas (Role)</Label>
            <select name="role" className="flex h-12 w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C185] text-[#07303F] font-medium">
                {roleOptions.map((role) => (
                    <option key={role} value={role}>
                        {role === "PARTNER" ? "WEDDING ORGANIZER (Partner)" : 
                         role === "CLIENT" ? "CALON PENGANTIN (Client)" : 
                         role}
                    </option>
                ))}
            </select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Key (Password)</Label>
            <Input id="password" name="password" type="password" required placeholder="••••••••" className="bg-white border-slate-200 focus-visible:ring-[#E5C185] h-12 rounded-sm" />
          </div>

          <div className="pt-4 border-t border-slate-200 mt-2">
            <Button type="submit" disabled={loading} className="w-full bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] font-bold uppercase tracking-widest text-xs h-12 rounded-sm transition-all shadow-lg shadow-[#E5C185]/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Berikan Hak Akses"}
            </Button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}