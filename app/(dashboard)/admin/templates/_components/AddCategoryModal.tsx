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
        <Button variant="outline">+ Kategori Baru</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Kategori Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Nama Kategori</Label>
            <Input name="name" placeholder="Contoh: Javanese Series" required />
          </div>

          <div>
            <Label>Deskripsi (Opsional)</Label>
            <Input name="description" placeholder="Koleksi adat jawa..." />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : "Simpan Kategori"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}