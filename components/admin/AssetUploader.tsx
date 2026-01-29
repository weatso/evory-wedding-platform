"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client"; // Pastikan path ini benar sesuai setup Anda
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner"; // Atau library toast yang Anda pakai

interface AssetUploaderProps {
  bucketName?: string;
  storagePath: string; // [BARU] Folder tujuan (misal: 'users/123' atau 'system/mockups')
  onUploadComplete: (url: string) => void;
  defaultImage?: string;
  label?: string;
}

export default function AssetUploader({
  bucketName = "wedding-assets", // Nama bucket di Supabase
  storagePath, 
  onUploadComplete,
  defaultImage,
  label = "Upload Image"
}: AssetUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // 1. Validasi File
      if (file.size > 2 * 1024 * 1024) throw new Error("File terlalu besar (Max 2MB)");

      // 2. Generate Nama Unik (Agar tidak menimpa file lain)
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // 3. Susun Path Lengkap: storagePath/fileName
      // Contoh: "users/user_123/invitation_abc/gallery/foto1.jpg"
      const fullPath = `${storagePath}/${fileName}`;

      // 4. Upload ke Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fullPath, file, { upsert: true });

      if (error) throw error;

      // 5. Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fullPath);

      setPreview(publicUrl);
      onUploadComplete(publicUrl);
      toast.success("Upload berhasil!");

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete(""); // Kosongkan field di database
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</label>
      
      <div className="border-2 border-dashed border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
        {preview ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black/20 group">
            <Image src={preview} alt="Preview" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Button variant="destructive" size="sm" onClick={handleRemove} type="button">
                 <X size={16} className="mr-2" /> Hapus
               </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500">
             <UploadCloud size={32} className="mb-2 opacity-50" />
             <p className="text-xs mb-4">JPG, PNG (Max 2MB)</p>
             <div className="relative">
                <Button disabled={uploading} variant="secondary" size="sm" type="button">
                  {uploading ? <Loader2 className="animate-spin mr-2" size={16}/> : null}
                  Pilih File
                </Button>
                <input 
                  type="file" 
                  accept="image/*"
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