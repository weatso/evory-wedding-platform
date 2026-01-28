"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Client Supabase (Gunakan Environment Variables!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AssetUploader({ 
  bucket = "wedding-assets", 
  path = "uploads", 
  onUploadComplete 
}: { 
  bucket?: string;
  path?: string;
  onUploadComplete: (url: string) => void; 
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    setUploading(true);

    try {
      // 1. Upload ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Ambil Public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // 3. Kembalikan URL ke Parent Component
      setPreview(data.publicUrl);
      onUploadComplete(data.publicUrl);
      
    } catch (error) {
      alert("Gagal upload gambar!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
      {preview ? (
        <div className="relative w-full h-40 mb-4">
            {/* Tampilkan Preview jika Gambar */}
            <img src={preview} className="w-full h-full object-contain rounded" alt="Preview" />
            <p className="text-xs text-green-600 mt-2 font-mono break-all">{preview}</p>
        </div>
      ) : (
        <div className="text-gray-500 mb-2">Belum ada file</div>
      )}

      <label className="cursor-pointer bg-[#5D4037] text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-[#4E342E] inline-block">
        {uploading ? "Mengupload..." : "Pilih File"}
        <input 
          type="file" 
          accept="image/*,audio/*" // Terima Gambar & Audio
          className="hidden" 
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      <p className="text-[10px] text-gray-400 mt-2">Max 5MB. JPG, PNG, MP3.</p>
    </div>
  );
}