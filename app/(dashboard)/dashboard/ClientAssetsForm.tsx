"use client";

import { useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, User, Heart, Image as ImageIcon, Monitor } from "lucide-react";
import SimpleUploadButton from "@/components/dashboard/SimpleUploadButton";
import { updateProjectImage, addToGallery, removeFromGallery } from "./media/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Props {
  projectId: string;
  userId: string;
  initialCover: string | null;
  initialGroom: string | null;
  initialBride: string | null;
  initialWings: string | null;
  initialGallery: string[];
}

export default function ClientAssetsForm({ projectId, userId, initialCover, initialGroom, initialBride, initialWings, initialGallery }: Props) {
  const [cover, setCover] = useState(initialCover);
  const [groom, setGroom] = useState(initialGroom);
  const [bride, setBride] = useState(initialBride);
  const [wings, setWings] = useState(initialWings);
  const [gallery, setGallery] = useState(initialGallery);

  const basePath = `users/${userId}/${projectId}`;

  const handleSetImage = async (type: "groom" | "bride" | "cover" | "wings", url: string, stateSetter: any) => {
      stateSetter(url);
      await updateProjectImage(projectId, type, url);
      toast.success(`Aset ${type} berhasil diperbarui!`);
  };

  const handleGalleryUpload = async (url: string) => {
      setGallery([...gallery, url]); 
      await addToGallery(projectId, url);
  };

  const handleDeleteFromGallery = async (url: string) => {
      if (cover === url) { toast.error("Tidak bisa menghapus Cover!"); return; }
      setGallery(gallery.filter(g => g !== url));
      await removeFromGallery(projectId, url, gallery);
  };

  return (
    <Tabs defaultValue="profiles" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profiles">Profil</TabsTrigger>
        <TabsTrigger value="background">Cover</TabsTrigger>
        <TabsTrigger value="gallery">Galeri</TabsTrigger>
      </TabsList>

      <TabsContent value="profiles" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-blue-100">
                <CardHeader className="bg-blue-50/50 pb-4"><CardTitle className="flex gap-2 text-blue-800"><User className="w-5 h-5"/> Pria</CardTitle></CardHeader>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-100 bg-slate-100">
                        {groom ? <Image src={groom} alt="Groom" fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-slate-300"><User className="w-16 h-16"/></div>}
                    </div>
                    <SimpleUploadButton destination="client" path={`${basePath}/groom`} onUploadComplete={(url) => handleSetImage("groom", url, setGroom)} label="Ganti Foto"/>
                </CardContent>
            </Card>
            <Card className="overflow-hidden border-pink-100">
                <CardHeader className="bg-pink-50/50 pb-4"><CardTitle className="flex gap-2 text-pink-800"><Heart className="w-5 h-5"/> Wanita</CardTitle></CardHeader>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-pink-100 bg-slate-100">
                        {bride ? <Image src={bride} alt="Bride" fill className="object-cover" /> : <div className="flex h-full items-center justify-center text-slate-300"><Heart className="w-16 h-16"/></div>}
                    </div>
                    <SimpleUploadButton destination="client" path={`${basePath}/bride`} onUploadComplete={(url) => handleSetImage("bride", url, setBride)} label="Ganti Foto"/>
                </CardContent>
            </Card>
      </TabsContent>

      <TabsContent value="background" className="space-y-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Monitor className="w-5 h-5 text-purple-600"/> Background Desktop</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden border-2 border-dashed">{wings && <Image src={wings} alt="Wings" fill className="object-cover" />}</div>
                <SimpleUploadButton destination="client" path={`${basePath}/wings`} onUploadComplete={(url) => handleSetImage("wings", url, setWings)} label="Upload Custom"/>
            </CardContent>
        </Card>
        <Card className="bg-slate-900 border-0">
            <div className="relative w-full h-48 bg-slate-800">
                {cover && <Image src={cover} alt="Cover" fill className="object-cover opacity-80" />}
                <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                    <h3 className="text-xl text-white font-bold flex items-center gap-2"><Star className="text-amber-400 fill-amber-400"/> Cover Undangan</h3>
                </div>
            </div>
        </Card>
      </TabsContent>

      <TabsContent value="gallery" className="space-y-4">
        <div className="flex justify-between"><h3 className="text-lg font-bold">Galeri Foto</h3><SimpleUploadButton destination="client" path={`${basePath}/gallery`} onUploadComplete={handleGalleryUpload} label="Tambah Foto"/></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((url, idx) => {
                const isCover = url === cover;
                return (
                    <div key={idx} className={`group relative aspect-[3/4] rounded-lg overflow-hidden border-2 ${isCover ? 'border-amber-400' : 'border-transparent'}`}>
                        <Image src={url} alt="Gallery" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col justify-center gap-2 p-2">
                            {!isCover && <Button size="sm" variant="secondary" onClick={() => handleSetImage("cover", url, setCover)}>Jadikan Cover</Button>}
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteFromGallery(url)}>Hapus</Button>
                        </div>
                    </div>
                )
            })}
        </div>
      </TabsContent>
    </Tabs>
  );
}