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
import { toast } from "sonner";
import { PackageTier } from "@prisma/client";

const selectStyle = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type Category = {
  id: string;
  name: string;
};

export function AddTemplateModal({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // STATE MANAGEMENT UNTUK UX INTERAKTIF
  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tier, setTier] = useState<PackageTier>(PackageTier.ESSENTIAL);
  const [isFeatured, setIsFeatured] = useState(false);

  // AUTO-SLUG GENERATOR
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // Ubah "Kraton Mewah" menjadi "kraton-mewah" secara instan
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Pastikan data state yang dimanipulasi visual masuk ke FormData
    formData.set("thumbnail", imageUrl); 
    formData.set("tier", tier);
    formData.set("isFeatured", isFeatured ? "true" : "false");

    const res = await createTemplate(formData);

    setLoading(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Template berhasil ditambahkan!");
      setOpen(false); 
      // Reset Form
      setImageUrl(""); 
      setName("");
      setSlug("");
      setTier(PackageTier.ESSENTIAL);
      setIsFeatured(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#07303F] text-white hover:bg-[#07303F]/90">+ Tambah Template</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif italic text-[#07303F]">Tambah Masterpiece Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KOLOM KIRI: Identitas Dasar */}
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nama Template</Label>
                <Input 
                  name="name" 
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Contoh: Javanese Kraton" 
                  required 
                  className="mt-1" 
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Slug (ID URL)</Label>
                <Input 
                  name="slug" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)} // Tetap bisa diedit manual jika perlu
                  placeholder="javanese-kraton" 
                  required 
                  className="mt-1 bg-slate-50 font-mono text-sm" 
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Kategori Desain</Label>
                {categories.length > 0 ? (
                  <select name="categoryId" className={`${selectStyle} mt-1`} required defaultValue="">
                    <option value="" disabled>-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[10px] text-red-500 mt-1">Buat kategori dulu di tabel sebelah.</p>
                )}
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Deskripsi Singkat</Label>
                <textarea 
                  name="description" 
                  placeholder="Jelaskan nuansa desain ini..." 
                  className={`${selectStyle} mt-1 h-20 resize-none`}
                  required
                />
              </div>
            </div>

            {/* KOLOM KANAN: Visual & Konfigurasi Bisnis */}
            <div className="space-y-6">
              
              {/* UPLOAD THUMBNAIL */}
              <div className="border border-slate-200 p-4 rounded-xl bg-[#F9F8F4]/50">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Thumbnail Katalog</Label>
                <SimpleUploadButton
                  destination="system"
                  path="templates/thumbnails"
                  onUploadComplete={(url: string) => setImageUrl(url)}
                  label="Upload Gambar Preview"
                />
                {imageUrl && (
                  <div className="mt-4 relative w-full aspect-[4/3] bg-slate-200 rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                )}
              </div>

              {/* TIER SELECTION VISUAL (Bukan Dropdown) */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block">Package Tier</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["ESSENTIAL", "PRESTIGE", "ROYAL"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTier(t as PackageTier)}
                      className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all ${
                        tier === t 
                          ? "bg-[#07303F] text-white border-[#07303F] shadow-md" 
                          : "bg-white text-slate-500 border-slate-200 hover:border-[#E5C185]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* ETALASE TOGGLE */}
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white shadow-sm">
                <div>
                  <Label className="text-sm font-bold text-[#07303F]">Featured Template</Label>
                  <p className="text-[10px] text-slate-500 mt-0.5">Tampilkan di halaman depan (Landing Page)?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E5C185] focus:ring-offset-2 ${
                    isFeatured ? 'bg-[#E5C185]' : 'bg-slate-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isFeatured ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button 
              type="submit" 
              disabled={loading || !imageUrl || categories.length === 0} 
              className="w-full h-12 bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] font-bold uppercase tracking-widest text-xs"
            >
              {loading ? "Menyimpan Karya..." : "Rilis Template ke Vault"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}