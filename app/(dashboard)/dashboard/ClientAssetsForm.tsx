"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AssetUploader from "@/components/admin/AssetUploader";
import { updateInvitationAssets } from "@/app/invitation/actions"; // Nanti kita buat server action ini
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  invitationId: string;
  userId: string;
  initialCover?: string | null;
  initialGallery: string[];
}

export default function ClientAssetsForm({ invitationId, userId, initialCover, initialGallery }: Props) {
  // Folder Khusus Client: users/[USER_ID]/[INV_ID]
  const clientStoragePath = `users/${userId}/${invitationId}`;
  
  const [coverUrl, setCoverUrl] = useState(initialCover);
  
  // Fungsi Simpan ke Database
  const handleSave = async () => {
    try {
        // PERBAIKAN: Gunakan operator || undefined agar jika null/kosong dikirim sebagai undefined
        await updateInvitationAssets(invitationId, { 
            coverImageUrl: coverUrl || undefined 
        });
        toast.success("Aset undangan berhasil disimpan!");
    } catch (error) {
        toast.error("Gagal menyimpan data.");
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-slate-800">Media Undangan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* UPLOAD COVER */}
        <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-700">Foto Cover Utama</h3>
            <AssetUploader
                label="Upload Cover (Format Portrait)"
                storagePath={`${clientStoragePath}/cover`} // Masuk subfolder cover
                defaultImage={coverUrl || ""}
                onUploadComplete={(url) => setCoverUrl(url)}
            />
        </div>

        {/* TOMBOL SIMPAN */}
        <div className="pt-4 border-t border-slate-100">
            <Button onClick={handleSave} className="w-full bg-slate-900 text-white">
                Simpan Perubahan Media
            </Button>
        </div>

      </CardContent>
    </Card>
  );
}