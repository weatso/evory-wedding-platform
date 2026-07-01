"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCategory } from "../actions";

export function AddCategoryModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createCategory(formData);

    setLoading(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setOpen(false); // Tutup modal jika sukses
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-[#07303F] border border-slate-300 hover:bg-slate-50 hover:border-[#07303F] font-bold shadow-sm">+ Kategori Baru</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#F9F8F4]">
        <DialogHeader>
          <DialogTitle>Buat Kategori Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#07303F]">Nama Kategori</Label>
            <Input name="name" placeholder="Contoh: Javanese Series" required className="bg-white border-slate-200" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#07303F]">Deskripsi (Opsional)</Label>
            <Input name="description" placeholder="Koleksi adat jawa..." className="bg-white border-slate-200" />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] font-bold mt-2">
            {loading ? "Menyimpan..." : "Simpan Kategori"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}