"use client";

import { useState, useEffect } from "react";
import { MailOpen } from "lucide-react";

export interface BaseSplashProps {
  guestName?: string | null;
  guestCategory?: string | null;
  onOpen: () => void; // Fungsi yang akan dipanggil saat tombol diklik (misal: memutar musik)
  // Injeksi Estetika
  styles?: {
    wrapper?: string;
    overlay?: string;
    contentBox?: string;
    introText?: string;
    guestNameText?: string;
    guestCategoryText?: string;
    button?: string;
  };
  // Slot untuk menyuntikkan gambar background atau ornamen amplop
  background?: React.ReactNode;
}

export default function BaseSplash({ guestName, guestCategory, onOpen, styles = {}, background }: BaseSplashProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  // Mencegah scroll pada body saat splash masih menutupi layar
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    onOpen(); // Panggil fungsi dari luar (untuk play musik dll)
    
    // Hapus dari DOM setelah animasi selesai (misal 1 detik)
    setTimeout(() => {
      setShouldRender(false);
    }, 1000);
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`absolute top-0 left-0 w-full h-[100dvh] z-[100] flex items-center justify-center transition-all duration-1000 ease-in-out ${
        isOpen ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      } ${styles.wrapper || "bg-black"}`}
    >
      {/* Latar Belakang / Ornamen */}
      {background && <div className="absolute inset-0 z-0">{background}</div>}
      
      {/* Overlay Gelap (Opsional, agar teks terbaca) */}
      <div className={`absolute inset-0 z-10 ${styles.overlay || "bg-black/60"}`}></div>

      {/* Konten Utama */}
      <div className={`relative z-20 flex flex-col items-center text-center p-6 ${styles.contentBox || "space-y-6"}`}>
        
        {guestName ? (
          <div className="space-y-2 animate-in fade-in zoom-in duration-1000 delay-300">
            <p className={styles.introText || "text-xs tracking-widest uppercase text-white/70"}>
              Kepada Yth, Bapak/Ibu/Saudara/i:
            </p>
            <h2 className={styles.guestNameText || "text-4xl font-bold text-white font-serif"}>
              {guestName}
            </h2>
            {guestCategory && (
              <span className={styles.guestCategoryText || "inline-block mt-2 px-3 py-1 bg-white/20 text-white text-[10px] rounded-full"}>
                {guestCategory}
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in zoom-in duration-1000 delay-300">
            <p className={styles.introText || "text-xs tracking-widest uppercase text-white/70"}>
              Undangan Pernikahan
            </p>
            <h2 className={styles.guestNameText || "text-2xl font-bold text-white font-serif"}>
              Tamu Undangan
            </h2>
          </div>
        )}

        <div className="pt-8">
          <p className="text-xs text-white/60 mb-4 italic max-w-xs mx-auto">
            *Mohon maaf apabila ada kesalahan penulisan nama atau gelar
          </p>
          <button 
            onClick={handleOpen}
            className={styles.button || "inline-flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform"}
          >
            <MailOpen className="w-4 h-4" /> Buka Undangan
          </button>
        </div>

      </div>
    </div>
  );
}