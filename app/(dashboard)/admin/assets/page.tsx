"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Image as ImageIcon, Video, FileJson, Trash2, CheckCircle2 } from "lucide-react";
import SimpleUploadButton from "@/components/dashboard/SimpleUploadButton";
import { toast } from "sonner";
import Image from "next/image";

type UploadedAsset = {
  url: string;
  name: string;
  type: "image" | "video" | "lottie";
};

export default function AdminAssetsPage() {
  const [recentAssets, setRecentAssets] = useState<UploadedAsset[]>([]);

  const handleUploadComplete = (url: string) => {
    let type: "image" | "video" | "lottie" = "image";
    if (url.endsWith(".webm") || url.endsWith(".mp4")) type = "video";
    if (url.endsWith(".json")) type = "lottie";

    const fileName = url.split('/').pop() || "asset-file";

    setRecentAssets((prev) => [{ url, name: fileName, type }, ...prev]);
    toast.success("Aset berhasil diunggah ke R2!");
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL Aset berhasil disalin!");
  };

  const removeAssetFromView = (url: string) => {
    setRecentAssets((prev) => prev.filter((a) => a.url !== url));
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Brankas Aset Desain</h1>
          <p className="text-slate-500 mt-1">Upload elemen visual (SVG, PNG, WebM) untuk digunakan oleh Frontend Developer.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: UPLOADER */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="bg-blue-50/50 pb-4">
              <CardTitle className="text-lg text-blue-800">Upload Aset Baru</CardTitle>
              <CardDescription>File akan masuk ke folder sistem, aman dari data klien.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="w-full p-8 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/20 flex flex-col items-center justify-center text-center">
                <ImageIcon className="w-12 h-12 text-blue-300 mb-3" />
                <p className="text-sm font-medium text-slate-600 mb-4">SVG, PNG, WEBP, atau Lottie JSON</p>
                {/* PERTAHANAN ARSITEKTUR:
                  Parameter destination="system" dan path yang di-hardcode memastikan 
                  desainer tidak bisa mengotak-atik folder /users/ milik klien.
                */}
                <SimpleUploadButton 
                  destination="system" 
                  path={`system/assets/templates/${Date.now()}`} 
                  onUploadComplete={handleUploadComplete} 
                  label="Pilih File Aset"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-sm text-amber-800">
            <strong>Instruksi Desainer:</strong>
            <ul className="list-decimal ml-4 mt-2 space-y-1">
              <li>Upload gapura, ornamen, atau background di sini.</li>
              <li>Klik tombol <b>Copy URL Frontend</b> pada file yang berhasil diunggah.</li>
              <li>Kirimkan URL tersebut ke tim Frontend untuk dimasukkan ke dalam kode.</li>
            </ul>
          </div>
        </div>

        {/* KOLOM KANAN: HASIL UPLOAD */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" /> Aset Sesi Ini
          </h3>
          
          {recentAssets.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-slate-400">
              <p>Belum ada aset yang diunggah pada sesi ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentAssets.map((asset) => (
                <Card key={asset.url} className="overflow-hidden border-slate-200 shadow-sm group">
                  <div className="h-40 bg-slate-100 relative border-b border-slate-200 flex items-center justify-center overflow-hidden">
                    {asset.type === "image" && <Image src={asset.url} alt={asset.name} fill className="object-contain p-4" />}
                    {asset.type === "video" && <video src={asset.url} autoPlay loop muted className="w-full h-full object-cover opacity-50" />}
                    {asset.type === "lottie" && <FileJson className="w-16 h-16 text-slate-300" />}

                    <Badge className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm">
                      {asset.type.toUpperCase()}
                    </Badge>

                    <button 
                      onClick={() => removeAssetFromView(asset.url)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Sembunyikan dari daftar ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <CardContent className="p-4 bg-white">
                    <p className="text-xs font-mono text-slate-500 truncate mb-3" title={asset.name}>
                      {asset.name}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => copyToClipboard(asset.url)}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Copy URL Frontend
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}