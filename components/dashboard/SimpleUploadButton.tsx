"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Inisialisasi Supabase Client Component
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  bucket: string;
  path: string;
  onUploadComplete: (url: string) => void;
  label?: string;
  className?: string;
}

export default function SimpleUploadButton({ bucket, path, onUploadComplete, label = "Upload", className }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    setUploading(true);

    try {
      const { error } = await supabase.storage.from(bucket).upload(filePath, file);
      if (error) throw error;

      // Ambil Public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      
      onUploadComplete(data.publicUrl);
      toast.success("Upload berhasil!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal upload file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        id={`upload-${path}`}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <label htmlFor={`upload-${path}`}>
        <div className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <UploadCloud className="w-4 h-4 mr-2"/>}
            {uploading ? "Mengunggah..." : label}
        </div>
      </label>
    </div>
  );
}