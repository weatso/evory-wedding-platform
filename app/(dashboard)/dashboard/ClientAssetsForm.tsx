"use client";

import { useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, User, Heart, Image as ImageIcon } from "lucide-react";
import SimpleUploadButton from "@/components/dashboard/SimpleUploadButton";
import { updateInvitationImage, addToGallery, removeFromGallery } from "./media/actions"; // Import actions
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Props {
  invitationId: string;
  userId: string;
  initialCover: string | null;
  initialGroom: string | null;
  initialBride: string | null;
  initialGallery: string[];
}

export default function ClientAssetsForm({ 
    invitationId, userId, initialCover, initialGroom, initialBride, initialGallery 
}: Props) {
  
  // Kita simpan state lokal agar UI terasa responsif (Optimistic UI simpel)
  const [cover, setCover] = useState(initialCover);
  const [groom, setGroom] = useState(initialGroom);
  const [bride, setBride] = useState(initialBride);
  const [gallery, setGallery] = useState(initialGallery);

  const basePath = `users/${userId}/${invitationId}`;

  // --- HANDLERS ---
  
  const handleGroomUpload = async (url: string) => {
      setGroom(url);
      await updateInvitationImage(invitationId, "groom", url);
  };

  const handleBrideUpload = async (url: string) => {
      setBride(url);
      await updateInvitationImage(invitationId, "bride", url);
  };

  const handleGalleryUpload = async (url: string) => {
      setGallery([...gallery, url]); // Update UI duluan
      await addToGallery(invitationId, url);
  };

  const handleSetCover = async (url: string) => {
      setCover(url);
      await updateInvitationImage(invitationId, "cover", url);
      toast.success("Cover berhasil diganti!");
  };

  const handleDeleteFromGallery = async (url: string) => {
      if (cover === url) {
          toast.error("Tidak bisa menghapus foto yang sedang menjadi Cover!");
          return;
      }
      const newGallery = gallery.filter(g => g !== url);
      setGallery(newGallery);
      await removeFromGallery(invitationId, url, gallery);
      toast.success("Foto dihapus.");
  };

  return (
    <Tabs defaultValue="profiles" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profiles">Profil Mempelai</TabsTrigger>
        <TabsTrigger value="gallery">Galeri & Cover</TabsTrigger>
      </TabsList>

      {/* --- TAB 1: PROFIL MEMPELAI --- */}
      <TabsContent value="profiles" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* GROOM CARD */}
            <Card className="overflow-hidden border-blue-100">
                <CardHeader className="bg-blue-50/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                        <User className="w-5 h-5"/> Mempelai Pria (Groom)
                    </CardTitle>
                    <CardDescription>Foto close-up atau setengah badan.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-100 shadow-sm bg-slate-100">
                        {groom ? (
                            <Image src={groom} alt="Groom" fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-300"><User className="w-16 h-16"/></div>
                        )}
                    </div>
                    <SimpleUploadButton 
                        bucket="wedding-assets" 
                        path={`${basePath}/groom`} 
                        onUploadComplete={handleGroomUpload}
                        label="Ganti Foto Pria"
                    />
                </CardContent>
            </Card>

            {/* BRIDE CARD */}
            <Card className="overflow-hidden border-pink-100">
                <CardHeader className="bg-pink-50/50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-pink-800">
                        <Heart className="w-5 h-5"/> Mempelai Wanita (Bride)
                    </CardTitle>
                    <CardDescription>Foto close-up atau setengah badan.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center gap-4">
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-pink-100 shadow-sm bg-slate-100">
                        {bride ? (
                            <Image src={bride} alt="Bride" fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-300"><Heart className="w-16 h-16"/></div>
                        )}
                    </div>
                    <SimpleUploadButton 
                        bucket="wedding-assets" 
                        path={`${basePath}/bride`} 
                        onUploadComplete={handleBrideUpload}
                        label="Ganti Foto Wanita"
                        className="w-full"
                    />
                </CardContent>
            </Card>
        </div>
      </TabsContent>

      {/* --- TAB 2: GALERI & COVER --- */}
      <TabsContent value="gallery" className="space-y-6">
        
        {/* COVER PREVIEW */}
        <Card className="bg-slate-900 text-white overflow-hidden border-0 shadow-lg">
            <div className="relative w-full h-48 md:h-64 bg-slate-800">
                {cover ? (
                    <Image src={cover} alt="Cover" fill className="object-cover opacity-80" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <ImageIcon className="w-12 h-12 mb-2"/>
                        <p>Belum ada cover dipilih</p>
                    </div>
                )}
                <div className="absolute bottom-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent w-full">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400"/> Cover Undangan
                    </h3>
                    <p className="text-sm text-slate-300">Foto ini akan muncul pertama kali saat undangan dibuka.</p>
                </div>
            </div>
        </Card>

        {/* GALLERY GRID */}
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Galeri Foto</h3>
                    <p className="text-sm text-slate-500">Upload foto prewedding Anda di sini.</p>
                </div>
                <div className="w-40">
                    <SimpleUploadButton 
                        bucket="wedding-assets" 
                        path={`${basePath}/gallery`} 
                        onUploadComplete={handleGalleryUpload}
                        label="Tambah Foto"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.length === 0 && (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                        Belum ada foto di galeri.
                    </div>
                )}

                {gallery.map((url, idx) => {
                    const isCover = url === cover;
                    return (
                        <div key={idx} className={`group relative aspect-[3/4] rounded-lg overflow-hidden border-2 shadow-sm transition-all ${isCover ? 'border-amber-400 ring-2 ring-amber-100' : 'border-transparent hover:border-slate-300'}`}>
                            <Image src={url} alt="Gallery" fill className="object-cover" />
                            
                            {/* OVERLAY ACTIONS (Muncul saat hover) */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                {!isCover && (
                                    <Button 
                                        size="sm" 
                                        variant="secondary" 
                                        className="w-full text-xs h-8 bg-white/90 hover:bg-white text-slate-900"
                                        onClick={() => handleSetCover(url)}
                                    >
                                        <Star className="w-3 h-3 mr-1"/> Jadikan Cover
                                    </Button>
                                )}
                                <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    className="w-full text-xs h-8 bg-red-500/90 hover:bg-red-600"
                                    onClick={() => handleDeleteFromGallery(url)}
                                >
                                    <Trash2 className="w-3 h-3 mr-1"/> Hapus
                                </Button>
                            </div>

                            {/* ACTIVE BADGE */}
                            {isCover && (
                                <div className="absolute top-2 right-2">
                                    <Badge className="bg-amber-400 text-black hover:bg-amber-500 border-0">Cover</Badge>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}