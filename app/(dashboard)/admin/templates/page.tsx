"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AssetUploader from "@/components/admin/AssetUploader";
import { toast } from "sonner";

// Daftar Template Hardcode (sesuai landing page)
const TEMPLATES = ["javanese", "modern", "luxury"]; 

export default function TemplateManager() {
  
  const handleMockupUpdate = (templateId: string, url: string) => {
      console.log(`Update mockup for ${templateId} to ${url}`);
      // Di sini Anda bisa panggil Server Action untuk update database (jika ada tabel template)
      // Atau sekedar log URL untuk dicopy ke kode landing page
      toast.success(`URL Mockup ${templateId}: ${url}`);
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
       <h1 className="text-2xl font-bold">Template Mockup Manager (Admin Only)</h1>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEMPLATES.map((tpl) => (
              <Card key={tpl}>
                  <CardHeader>
                      <CardTitle className="capitalize">{tpl} Series</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <AssetUploader 
                          label="Upload Mockup HP"
                          storagePath={`system/mockups/${tpl}`} // FOLDER SYSTEM KHUSUS ADMIN
                          onUploadComplete={(url) => handleMockupUpdate(tpl, url)}
                      />
                  </CardContent>
              </Card>
          ))}
       </div>
    </div>
  );
}