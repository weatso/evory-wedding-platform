"use client";

import { useParams } from "next/navigation";
import { getTemplate } from "@/components/templates/registry";
import { MOCK_WEDDING_DATA } from "@/lib/mock-data";
import React, { useMemo } from "react";

export default function InvitationPage() {
  const params = useParams();
  const slug = params.slug as string;

  // 1. Ambil ID Template (Untuk tes, kita pakai "MIN_01")
  const templateId = "MIN_01"; 

  // 2. Ambil komponen secara dinamis lewat registry
  const TemplateComponent = useMemo(() => getTemplate(templateId), [templateId]);

  // 3. Gunakan data dari Mock Data (Gunakan data alih-alih MOCK_WEDDING_DATA agar lebih rapi)
  const data = MOCK_WEDDING_DATA;

  return (
    <div className="relative min-h-screen w-full bg-evory-base overflow-x-hidden">
      
      {/* DESKTOP WINGS: Latar belakang lebar yang di-blur di sisi luar laptop */}
      <div 
        className="fixed inset-0 z-0 hidden lg:block opacity-30 blur-xl pointer-events-none"
        style={{ 
          backgroundImage: `url('/templates/${templateId}/bg-desktop.webp')`,
          backgroundSize: 'cover'
        }}
      />

      {/* PANGGUNG UTAMA: Konten utama dikunci di lebar 400px (Mobile-First) */}
      <div className="relative z-10 mx-auto w-full max-w-[400px] shadow-2xl bg-white min-h-screen">
        <TemplateComponent 
          invitation={data.invitation} 
          guest={data.guest} 
          config={data.config} 
        />
      </div>
    </div>
  );
}