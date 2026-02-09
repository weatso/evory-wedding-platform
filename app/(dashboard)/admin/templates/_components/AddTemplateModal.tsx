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
import { createTemplate } from "../actions";
// PASTIKAN IMPORT INI SESUAI FILE ANDA (Default Export)
import SimpleUploadButton from "@/components/dashboard/SimpleUploadButton";

const selectStyle = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type Category = {
  id: string;
  name: string;
};

export function AddTemplateModal({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("thumbnail", imageUrl); 

    const res = await createTemplate(formData);

    setLoading(false);
    if (res?.error) {
      alert(res.error);
    } else {
      setOpen(false); 
      setImageUrl(""); 
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Tambah Template</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Tambah Template Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          
          {/* NAMA */}
          <div>
            <Label>Nama Template</Label>
            <Input name="name" placeholder="Contoh: JVN-01 (Kraton)" required />
          </div>

          {/* SLUG */}
          <div>
            <Label>Slug (URL)</Label>
            <Input name="slug" placeholder="jvn-01" required />
            <p className="text-[10px] text-gray-500">Hanya huruf kecil, angka, dan strip (-)</p>
          </div>

          {/* KATEGORI */}
          <div>
            <Label>Kategori</Label>
            {categories.length > 0 ? (
              <select name="categoryId" className={selectStyle} required defaultValue="">
                <option value="" disabled>-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-red-500 mt-1">
                Belum ada kategori. Silakan buat kategori dulu.
              </p>
            )}
          </div>

          {/* UPLOAD THUMBNAIL */}
          <div className="border p-4 rounded-md bg-slate-50">
            <Label>Thumbnail Image</Label>
            <div className="mt-2">
               {/* FIX: Menambahkan props wajib bucket & path */}
               <SimpleUploadButton 
                  bucket="wedding-assets"
                  path="templates"
                  onUploadComplete={(url: string) => setImageUrl(url)} 
               />
               
               {imageUrl && (
                 <div className="mt-2 relative w-full h-32 bg-gray-200 rounded overflow-hidden">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                 </div>
               )}
               
               <input type="hidden" name="thumbnail" value={imageUrl} required />
            </div>
          </div>

          {/* PREVIEW URL */}
          <div>
            <Label>Link Preview (Demo)</Label>
            <Input name="previewUrl" placeholder="/invitation/demo-jvn01" />
          </div>

          {/* DESKRIPSI */}
          <div>
            <Label>Deskripsi Singkat</Label>
            <Input name="description" placeholder="Tema Jawa Klasik..." />
          </div>

          <Button type="submit" disabled={loading || !imageUrl || categories.length === 0} className="w-full">
            {loading ? "Menyimpan..." : "Simpan Template"}
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  );
}