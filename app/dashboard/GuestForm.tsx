'use client';

import { useRef, useState, useEffect } from "react";
import { addGuest } from "./actions"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Save } from "lucide-react";
import { generateGuestCode } from "@/lib/utils"; 

export default function GuestForm({ invitationId }: { invitationId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  useEffect(() => {
    setGeneratedCode(generateGuestCode(5));
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <UserPlus className="w-5 h-5 text-amber-600" />
        <h3 className="font-bold">Tambah Tamu Baru</h3>
      </div>

      <form
        ref={formRef}
        action={async (formData) => {
          setIsPending(true);
          await addGuest(formData);
          setIsPending(false);
          
          formRef.current?.reset();
          // Reset default value untuk select dan input angka
          if (formRef.current) {
              const categorySelect = formRef.current.querySelector('select[name="category"]') as HTMLSelectElement;
              if (categorySelect) categorySelect.value = "Regular";
              
              const paxInput = formRef.current.querySelector('input[name="maxPax"]') as HTMLInputElement;
              if (paxInput) paxInput.value = "2";
          }
          
          setGeneratedCode(generateGuestCode(5)); 
        }}
        className="space-y-4"
      >
        <input type="hidden" name="invitationId" value={invitationId} />
        <input type="hidden" name="guestCode" value={generatedCode} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Tamu</Label>
              <Input name="name" placeholder="Contoh: Budi Santoso" required />
            </div>

            <div className="space-y-2">
              <Label>No. WhatsApp</Label>
              <Input name="whatsapp" placeholder="62812..." required type="tel" />
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
             {/* KOLOM KATEGORI (YANG SEBELUMNYA HILANG) */}
            <div className="space-y-2 col-span-1">
              <Label>Kategori</Label>
              <select name="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                   <option value="Regular">Regular</option>
                   <option value="VIP">VIP</option>
                   <option value="Keluarga">Keluarga</option>
                   <option value="Teman">Teman Kerja</option>
              </select>
            </div>

            <div className="space-y-2 col-span-1">
              <Label>Jatah Kursi</Label>
              <Input 
                name="maxPax" 
                type="number" 
                defaultValue="2" 
                min="1" 
                required 
                className="text-center"
              />
            </div>
            
            <div className="col-span-2">
                <Button type="submit" disabled={isPending || !generatedCode} className="w-full bg-slate-900 hover:bg-slate-800">
                    {isPending ? "Menyimpan..." : <><Save className="w-4 h-4 mr-2"/> Simpan Data</>}
                </Button>
            </div>
        </div>
      </form>
      
      <p className="text-[10px] text-slate-400 mt-2">
        *Kode Unik Tamu: <span className="font-mono bg-slate-100 px-1 rounded text-slate-700">{generatedCode || "..."}</span>
      </p>
    </div>
  );
}