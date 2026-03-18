"use client";

import { useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { getPresignedUploadUrl } from "@/lib/actions/upload"; 

// Ubah bagian ini:
interface Props {
  destination: "client" | "system" | "wcc"; // <-- PERBAIKAN: Tambahkan "wcc"
  path: string;
  onUploadComplete: (url: string) => void;
  label?: string;
  className?: string;
}

export default function SimpleUploadButton({ destination, path, onUploadComplete, label = "Upload", className }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);

    try {
      // 1. Minta Tiket dari Server
      const res = await getPresignedUploadUrl(file.name, file.type, destination, path);
      if (!res.success || !res.uploadUrl) {
        throw new Error(res.error || "Gagal mendapatkan izin upload R2.");
      }

      // 2. Tembak file langsung ke Cloudflare R2 (Bypass Server Lokal)
      const uploadResponse = await fetch(res.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) throw new Error("Gagal mengunggah file ke CDN.");

      // 3. Kembalikan URL R2 ke form induk
      onUploadComplete(res.finalUrl!);
      toast.success("Upload berhasil!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal upload file.");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        id={`upload-${path}`}
        className="hidden"
        accept="image/*,video/mp4,audio/mpeg"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <label htmlFor={`upload-${path}`}>
        <div className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <UploadCloud className="w-4 h-4 mr-2"/>}
            {uploading ? "Mengunggah..." : label}
        </div>
      </label>
    </div>
  );
}