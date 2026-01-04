'use client';

import { useState, useRef } from "react";
import { addGuest } from "./actions"; // Import Server Action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Save } from "lucide-react";

export default function GuestForm({ invitationId }: { invitationId: string }) {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    // --- PERBAIKAN DI SINI ---
    // Sekarang kita kirim invitationId sebagai parameter pertama
    const result = await addGuest(invitationId, formData);
    
    setLoading(false);

    if (result?.error) {
      alert(result.error); // Ganti dengan Toast jika mau
    } else {
      // Sukses
      formRef.current?.reset(); // Kosongkan form
      // alert("Tamu berhasil ditambahkan!"); // Opsional
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-slate-100 rounded-full">
            <UserPlus className="w-5 h-5 text-slate-700" />
        </div>
        <h3 className="font-bold text-slate-800">Tambah Tamu Baru</h3>
      </div>

      <form ref={formRef} action={handleSubmit} className="space-y-3">
        {/* Hidden Inputs untuk default value */}
        <input type="hidden" name="maxPax" value="1" /> 
        
        <div className="space-y-1">
          <Label htmlFor="name" className="text-xs text-slate-500 uppercase font-bold">Nama Tamu</Label>
          <Input 
            id="name" 
            name="name" 
            placeholder="Contoh: Budi Santoso" 
            required 
            className="bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <Label htmlFor="category" className="text-xs text-slate-500 uppercase font-bold">Kategori</Label>
                <select 
                    name="category" 
                    id="category" 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                >
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="Keluarga">Keluarga</option>
                    <option value="Vendor">Vendor</option>
                </select>
            </div>
            <div className="space-y-1">
                <Label htmlFor="maxPax" className="text-xs text-slate-500 uppercase font-bold">Jatah Kursi</Label>
                <Input 
                    type="number" 
                    name="maxPax" 
                    id="maxPax"
                    defaultValue={1}
                    min={1}
                    required
                    className="bg-white"
                />
            </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="whatsapp" className="text-xs text-slate-500 uppercase font-bold">WhatsApp</Label>
          <Input 
            id="whatsapp" 
            name="whatsapp" 
            type="tel"
            placeholder="0812..." 
            className="bg-white"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 mt-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
                <Save className="w-4 h-4 mr-2" /> Simpan Data
            </>
          )}
        </Button>
      </form>
    </div>
  );
}