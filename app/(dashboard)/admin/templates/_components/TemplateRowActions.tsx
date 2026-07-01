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
import { updateTemplate, deleteTemplate } from "../actions";
import SimpleUploadButton from "@/components/dashboard/SimpleUploadButton";
import { toast } from "sonner";
import { PackageTier, Template } from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";

const selectStyle = "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C185] disabled:cursor-not-allowed disabled:opacity-50";

type Category = {
  id: string;
  name: string;
};

export function TemplateRowActions({ template, categories }: { template: Template, categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // STATE MANAGEMENT UNTUK EDIT
  const [imageUrl, setImageUrl] = useState(template.thumbnail || "");
  const [name, setName] = useState(template.name);
  const [slug, setSlug] = useState(template.slug);
  const [tier, setTier] = useState<PackageTier>(template.tier);
  const [isFeatured, setIsFeatured] = useState(template.isFeatured);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("thumbnail", imageUrl); 
    formData.set("tier", tier);
    formData.set("isFeatured", isFeatured ? "true" : "false");

    const res = await updateTemplate(template.id, formData);

    setLoading(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Template berhasil diperbarui!");
      setOpen(false); 
    }
  }

  async function handleDelete() {
    if (!confirm(`Yakin ingin menghapus template "${template.name}"? Ini tidak dapat dibatalkan.`)) return;
    setIsDeleting(true);
    const res = await deleteTemplate(template.id);
    setIsDeleting(false);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Template berhasil dihapus!");
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 px-2 text-[#07303F] border-slate-200 hover:bg-slate-50">
            <Pencil className="w-3 h-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] bg-[#F9F8F4]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif italic text-[#07303F]">Edit Masterpiece</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdate} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KOLOM KIRI: Identitas Dasar */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nama Template</Label>
                  <Input 
                    name="name" 
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Contoh: Javanese Kraton" 
                    required 
                    className="bg-white border-slate-200" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Slug (ID URL)</Label>
                  <Input 
                    name="slug" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)} 
                    placeholder="javanese-kraton" 
                    required 
                    className="bg-white border-slate-200 font-mono text-sm" 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Kategori Desain</Label>
                  {categories.length > 0 ? (
                    <select name="categoryId" className={`${selectStyle} bg-white border-slate-200`} required defaultValue={template.categoryId}>
                      <option value="" disabled>-- Pilih Kategori --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[10px] text-red-500 mt-1">Buat kategori dulu di tabel sebelah.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Deskripsi Singkat</Label>
                  <textarea 
                    name="description" 
                    defaultValue={template.description || ""}
                    placeholder="Jelaskan nuansa desain ini..." 
                    className={`${selectStyle} bg-white border-slate-200 h-20 resize-none`}
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
                    label="Ubah Gambar Preview"
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
                    {(["ESSENTIAL", "PRESTIGE", "ROYAL"] as PackageTier[]).map((t) => (
                      <div 
                        key={t}
                        onClick={() => setTier(t)}
                        className={`cursor-pointer border rounded-md p-3 text-center transition-all ${
                          tier === t 
                            ? 'bg-[#07303F] border-[#07303F] text-[#E5C185] shadow-md' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-[#E5C185]'
                        }`}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-widest">{t}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TOGGLE TAMPIL DI DEPAN */}
                <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Landing Page</Label>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tampilkan desain ini di etalase depan Evory.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#07303F]"></div>
                  </label>
                </div>

              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 bg-white border-slate-200 text-slate-600 hover:bg-slate-50">
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] font-bold shadow-lg">
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Button 
        onClick={handleDelete} 
        disabled={isDeleting} 
        size="sm" 
        variant="outline" 
        className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}
