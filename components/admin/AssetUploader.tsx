"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getPresignedUploadUrl } from "@/lib/actions/upload";

interface AssetUploaderProps {
  // PERBAIKAN: Ubah 'template' menjadi 'system' sesuai arsitektur R2 baru kita
  destination?: "client" | "system"; 
  storagePath: string; 
  onUploadComplete: (url: string) => void;
  defaultImage?: string;
  label?: string;
}

export default function AssetUploader({
  destination = "system", // PERBAIKAN: Default ke 'system' untuk area Admin
  storagePath, 
  onUploadComplete,
  defaultImage,
  label = "Upload Image"
}: AssetUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultImage || null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) throw new Error("Batas aman: Max 5MB");

      // Gunakan integrasi R2
      const res = await getPresignedUploadUrl(file.name, file.type, destination, storagePath);
      if (!res.success || !res.uploadUrl) throw new Error(res.error || "Gagal membuat URL CDN");

      const uploadResponse = await fetch(res.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) throw new Error("Gagal sinkronisasi dengan Cloudflare");

      setPreview(res.finalUrl!);
      onUploadComplete(res.finalUrl!);
      toast.success("Aset berhasil masuk ke CDN!");

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    // Di sini kita hanya menghapus dari UI dan DB. 
    // Penghapusan fisik R2 ditangani oleh Server Action utama yang menyimpan entitas ini.
    setPreview(null);
    onUploadComplete(""); 
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</label>
      <div className="border-2 border-dashed border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
        {preview ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black/20 group">
            {/* Hanya render next/image jika itu gambar, hindari error jika yang diupload file ZIP/audio */}
            {preview.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
               <Image src={preview} alt="Preview" fill className="object-cover" />
            ) : (
               <div className="flex items-center justify-center w-full h-full text-xs text-slate-300 break-all p-4 text-center">
                  {preview}
               </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Button variant="destructive" size="sm" onClick={handleRemove} type="button">
                 <X size={16} className="mr-2" /> Hapus
               </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500">
             <UploadCloud size={32} className="mb-2 opacity-50" />
             <p className="text-xs mb-4">Maksimal 5MB</p>
             <div className="relative">
                <Button disabled={uploading} variant="secondary" size="sm" type="button">
                  {uploading ? <Loader2 className="animate-spin mr-2" size={16}/> : null}
                  Pilih File
                </Button>
                <input 
                  type="file" 
                  onChange={handleUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
             </div>
          </div>
        )}
      </div>
    </div>
  );
}