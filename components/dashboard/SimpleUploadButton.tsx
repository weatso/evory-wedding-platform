"use client";

import { useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { getPresignedUploadUrl } from "@/lib/actions/upload"; 
import { useRouter } from "next/navigation"; // Tambahkan router untuk auto-refresh

interface Props {
  folder?: string; // Menjadi opsional
  destination?: "client" | "system" | "wcc" | "project"; // Tambahkan "project" untuk Vault
  path?: string;
  onUploadComplete?: (url: string, blurData?: string) => void;
  label?: string;
  className?: string;
}

export default function SimpleUploadButton({ 
  folder, 
  destination = "project", // Default ke project/vault
  path, 
  onUploadComplete, 
  label = "Unggah Aset", 
  className 
}: Props) {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);

    let finalFileToUpload = file;
    // Kompresi jika tipe file adalah gambar (kecuali SVG/GIF yang biasanya rusak jika dikompres biasa)
    if (file.type.startsWith("image/") && !file.type.includes("svg") && !file.type.includes("gif")) {
      try {
        const imageCompression = (await import('browser-image-compression')).default;
        const options = {
          maxSizeMB: 0.5, // Target 500KB
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/webp" // Konversi ke webp untuk performa maksimal
        };
        const compressedFile = await imageCompression(file, options);
        finalFileToUpload = compressedFile as File;
      } catch (err) {
        console.warn("Gagal mengkompresi gambar, menggunakan file asli.", err);
      }
    }

    // Amankan path upload
    const uploadPath = path || folder || "unassigned";

    try {
      // 1. Minta Tiket dari Server
      const finalFileName = finalFileToUpload.type === "image/webp" 
        ? finalFileToUpload.name.replace(/\.[^/.]+$/, "") + ".webp" 
        : finalFileToUpload.name;
        
      const res = await getPresignedUploadUrl(finalFileName, finalFileToUpload.type, destination, uploadPath);
      if (!res.success || !res.uploadUrl) {
        throw new Error(res.error || "Gagal mendapatkan izin upload S3/R2.");
      }

      // 2. Tembak file langsung ke Cloudflare R2 (Bypass Server Lokal)
      const uploadResponse = await fetch(res.uploadUrl, {
        method: "PUT",
        body: finalFileToUpload,
        headers: { "Content-Type": finalFileToUpload.type },
      });

      if (!uploadResponse.ok) throw new Error("Gagal mengunggah file ke infrastruktur CDN.");

      let blurDataUrl: string | undefined = undefined;
      
      // Jika gambar, buat Base64 LQIP (Low Quality Image Placeholder) via Canvas
      if (file.type.startsWith("image/")) {
        try {
          const img = document.createElement("img");
          const objectUrl = URL.createObjectURL(file);
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = objectUrl;
          });
          
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Resize ke ukuran sangat kecil (misal 10px lebarnya)
            const ratio = img.height / img.width;
            canvas.width = 10;
            canvas.height = Math.max(1, 10 * ratio);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            blurDataUrl = canvas.toDataURL("image/webp", 0.5);
          }
          URL.revokeObjectURL(objectUrl);
        } catch (err) {
          console.warn("Gagal membuat blur placeholder", err);
        }
      }

      toast.success("Aset berhasil diunggah!");
      
      // 3. Resolusi Pintar
      if (onUploadComplete) {
        // Jika form induk meminta URL, berikan URL dan blurData (jika ada)
        onUploadComplete(res.finalUrl!, blurDataUrl);
      } else {
        // Jika digunakan di Vault, cukup refresh halaman agar data terbaru muncul dari server
        router.refresh(); 
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal upload file.");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input agar bisa upload file yang sama lagi jika perlu
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        id={`upload-${folder || path || 'btn'}`}
        className="hidden"
        accept="image/*,video/mp4,audio/mpeg"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <label htmlFor={`upload-${folder || path || 'btn'}`}>
        <div className={`cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] shadow-lg shadow-[#07303F]/20 h-12 px-6 py-2 w-full ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
            {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <UploadCloud className="w-5 h-5 mr-2"/>}
            {uploading ? "Mentransfer..." : label}
        </div>
      </label>
    </div>
  );
}