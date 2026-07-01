'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, UserPlus } from "lucide-react";
import { useRef, useState } from "react";
import { addGuest } from "@/app/(dashboard)/workspace/[workspaceSlug]/actions";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function GuestForm({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const result = await addGuest(projectId, formData);

    setLoading(false);

    if (result?.error) {
      alert(result.error);
    } else {
      formRef.current?.reset();
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-[#07303F] hover:bg-[#0a455a] text-white">
          <UserPlus className="w-4 h-4" />
          Tambah 1 Tamu
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Tamu Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail tamu. Kode QR unik akan dihasilkan secara otomatis.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={handleSubmit} className="space-y-4 mt-2">
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
              <Label htmlFor="totalPaxAllocated" className="text-xs text-slate-500 uppercase font-bold">Jatah Kursi</Label>
              <Input
                type="number"
                name="totalPaxAllocated"
                id="totalPaxAllocated"
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

          <div className="space-y-1">
            <Label htmlFor="dietaryNotes" className="text-xs text-slate-500 uppercase font-bold">Catatan Makanan / Alergi</Label>
            <Input
              id="dietaryNotes"
              name="dietaryNotes"
              placeholder="Contoh: 1 Vegetarian, Alergi Kacang"
              className="bg-white"
            />
            <p className="text-[10px] text-slate-400">Biarkan kosong jika tidak ada pantangan.</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#07303F] hover:bg-[#0a455a] text-white mt-4">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Simpan Data
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}