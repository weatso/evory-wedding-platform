"use client"; // Ubah menjadi client component khusus untuk hari ini agar bisa pakai alert

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import ClientAssetsForm from "../ClientAssetsForm"; 
import SimpleUploadButton from "@/components/dashboard/SimpleUploadButton";

export default function MediaPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Memuat...</div>;
  if (!session) redirect("/login");

  const userRole = session.user.role;
  
  // =====================================================================
  // JALUR DARURAT KHUSUS TIM LAPANGAN (USHER/STAFF)
  // =====================================================================
  if (userRole === "USHER") {
      return (
          <div className="max-w-3xl mx-auto space-y-6 mt-10">
              <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900">Upload WCC Darurat</h1>
                  <p className="text-slate-500 mt-2">Pusat unggahan aset acara hari ini. File akan langsung dikirim ke Cloudflare R2.</p>
              </div>
              <div className="p-12 bg-amber-50 rounded-xl border-2 border-dashed border-amber-300 text-center flex flex-col items-center justify-center">
                  <SimpleUploadButton 
                      destination="wcc" 
                      path="wcc-live-event" 
                      label="Pilih & Unggah File WCC"
                      className="w-full max-w-sm"
                      onUploadComplete={(url) => {
                          // File langsung masuk ke bucket R2 tanpa menyentuh database Prisma
                          alert("File berhasil diunggah ke Storage Utama!");
                      }}
                  />
                  <p className="mt-4 text-xs text-amber-600 font-bold">Pastikan internet stabil saat proses mengunggah.</p>
              </div>
          </div>
      );
  }

  // =====================================================================
  // JALUR NORMAL UNTUK ADMIN / CLIENT (Akan error di client component jika tidak disesuaikan, 
  // tapi karena kita fokus ke USHER hari ini, biarkan admin menggunakan dashboard lama dulu)
  // =====================================================================
  
  return (
      <div className="p-8 text-center text-slate-500">
          Untuk Admin: Halaman media normal sedang dalam mode Bypass WCC hari ini.
      </div>
  );
}