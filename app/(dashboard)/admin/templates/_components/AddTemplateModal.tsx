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
import SimpleUploadButton from "@/components/dashboard/SimpleUploadButton";
import { toast } from "sonner"; // Tambahkan toast untuk notifikasi yang lebih elegan

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
      toast.error(res.error);
    } else {
      toast.success("Template berhasil ditambahkan!");
      setOpen(false); 
      setImageUrl(""); 
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 text-white hover:bg-slate-800">+ Tambah Template</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Tambah Template Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          
          <div className="grid grid-cols-2 gap-4">
            {/* NAMA */}
            <div>
              <Label className="text-xs">Nama Template</Label>
              <Input name="name" placeholder="Contoh: Kraton Mewah" required className="mt-1" />
            </div>

            {/* SLUG */}
            <div>
              <Label className="text-xs">Slug (ID Unik)</Label>
              <Input name="slug" placeholder="jvn-01" required className="mt-1" />
              <p className="text-[10px] text-gray-500 mt-1">Sesuai dengan di registry.tsx</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* KATEGORI (Dimensi Visual) */}
            <div>
              <Label className="text-xs">Kategori Desain</Label>
              {categories.length > 0 ? (
                <select name="categoryId" className={`${selectStyle} mt-1`} required defaultValue="">
                  <option value="" disabled>-- Pilih --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-[10px] text-red-500 mt-1">Buat kategori dulu.</p>
              )}
            </div>

            {/* TIER PAKET (Dimensi Bisnis) -> BARU DITAMBAHKAN */}
            <div>
              <Label className="text-xs">Hak Akses (Tier)</Label>
              <select name="tier" className={`${selectStyle} mt-1`} required defaultValue="ESSENTIAL">
                <option value="ESSENTIAL">Essential (Ekonomis)</option>
                <option value="PRESTIGE">Prestige (Menengah)</option>
                <option value="ROYAL">Royal Suites (Premium)</option>
                <option value="CUSTOM">The Legacy (Full Custom)</option>
              </select>
            </div>
          </div>

          {/* UPLOAD THUMBNAIL (Diselaraskan dengan Arsitektur R2) */}
          <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
            <Label className="text-xs">Thumbnail Katalog (Preview Image)</Label>
            <div className="mt-2">
               <SimpleUploadButton
                  // PERUBAHAN: Destination diubah menjadi "system" untuk memisahkan dari data klien
                  destination="system"
                  path="templates/thumbnails"
                  onUploadComplete={(url: string) => setImageUrl(url)}
                  label="Upload Gambar Preview"
               />
               
               {imageUrl && (
                 <div className="mt-3 relative w-full h-40 bg-slate-200 rounded-md overflow-hidden border border-slate-300 shadow-inner">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                 </div>
               )}
               <input type="hidden" name="thumbnail" value={imageUrl} required />
            </div>
          </div>

          {/* DESKRIPSI */}
          <div>
            <Label className="text-xs">Deskripsi Singkat</Label>
            <Input name="description" placeholder="Desain bernuansa adat jawa klasik..." className="mt-1" />
          </div>

          <Button type="submit" disabled={loading || !imageUrl || categories.length === 0} className="w-full bg-evory-gold text-black hover:bg-yellow-500 font-bold mt-4">
            {loading ? "Menyimpan ke Database..." : "Rilis Template"}
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  );
}