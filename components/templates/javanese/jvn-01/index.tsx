"use client";

import { WeddingTemplateProps } from "@/types/template";
import BaseSectionWrapper from "../../base/BaseSectionWrapper";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import localFont from 'next/font/local';

// 1. KONFIGURASI FONT LOKAL
// Ganti 'NamaFileFont' dengan nama file asli di folder Anda (misal: .ttf atau .woff2)
const fontJudul = localFont({
  src: '../../../../public/templates/javanese/jvn-01/fonts/Crimson_Pro/CrimsonPro-VariableFont_wght.ttf', 
  variable: '--font-judul'
});

const fontIsi = localFont({
  src: '../../../../public/templates/javanese/jvn-01/fonts/lt_perfume/LTPerfume-2.ttf',
  variable: '--font-isi'
});

// Helper Path Aset
const ASSETS = "/templates/javanese/jvn-01";

// 2. DEFINISI WARNA (DNA Desain Javanese Royal)
const PALETTE = {
  primary: "#818362",    // Coklat Tua (Teks)
  secondary: "#AC8E85",  // Coklat Muda (Aksen)
  background: "#F1F1E8", // Krem (Latar Belakang)
  accent: "#D7CCC8"      // Garis/Border
};

// --- KOMPONEN GALLERY FRAME (DIPERBAIKI) ---
const GalleryFrame = ({ frameSrc, photoSrc, className }: { frameSrc: string, photoSrc: string, className?: string }) => (
  <div className={`relative flex items-center justify-center overflow-hidden rounded-lg ${className}`}>
    {/* LAPIS 1: FOTO (Di Belakang) */}
    <img 
      src={photoSrc} 
      alt="Wedding Gallery" 
      className="absolute inset-0 w-full h-full object-cover z-0" 
    />
    
    {/* LAPIS 2: FRAME (Di Depan) */}
    {/* Added: 'mix-blend-multiply' agar warna putih di tengah frame jadi transparan */}
    <img 
      src={frameSrc} 
      alt="Frame Overlay" 
      className="relative z-10 w-full h-full object-fill pointer-events-none mix-blend-multiply" 
    />
  </div>
);

export default function Jvn01({ invitation, guest, config }: WeddingTemplateProps) {
  // --- LOGIC: COUNTDOWN TIMER (Full Logic) ---
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(invitation.eventDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [invitation.eventDate]);

  return (
    <div className={`${fontIsi.variable} ${fontJudul.variable} font-isi min-h-screen text-[#4E342E]`} style={{ backgroundColor: PALETTE.background, // Hardcode dulu untuk tes
   backgroundSize: 'cover',
   backgroundPosition: 'center' }}>

      {/* --- [BARU] DESKTOP WINGS (Unik per Template) --- */}
    {/* visible hanya di layar besar (lg:block), diam di tempat (fixed) */}
    <div 
      className="fixed inset-0 z-0 hidden lg:block pointer-events-none"
      style={{ 
        backgroundImage: `url('${ASSETS}/WING/BACKGROUND 2.svg')`, // Ambil dari folder template ini
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 1 // Sesuaikan opacity sesuai selera desainer
      }}
    />
      
      {/* =================================================================
          SECTION 1: COVER
         ================================================================= */}
      <BaseSectionWrapper id="cover" className="min-h-screen flex flex-col items-center justify-center relative">
        {/* AKTIFKAN BACKGROUND: Hapus komentar di bawah ini jika ingin mencoba aset pattern */}
         <div className="absolute top-0 w-full h-full z-0 opacity-40">
           <img src={`${ASSETS}/01-Cover/PATTERN ATAS BACKGROUND.svg`} className="w-full h-full object-cover" alt="" />
        </div> 
        

        <div className="z-10 text-center relative mt-10 space-y-4">
           <p className="tracking-[0.2em] text-sm uppercase text-[#8D6E63]">The Wedding Of</p>
           
           <div className="space-y-2 py-6">
              <h1 className="font-judul text-5xl font-bold text-[#5D4037]">{invitation.groomNick}</h1>
              <div className="text-2xl text-[#8D6E63] font-serif">&</div>
              <h1 className="font-judul text-5xl font-bold text-[#5D4037]">{invitation.brideNick}</h1>
           </div>

           <div className="border-t border-b border-[#8D6E63] py-2 inline-block px-8">
              <p className="tracking-widest text-sm font-isi">
                {new Date(invitation.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
           </div>
        </div>

        {/* AREA ILUSTRASI (TEMPAT GAPURA/WAYANG) */}
        <div className="relative w-full max-w-[320px] mt-10 flex justify-center items-end">
           {/* Masukkan aset Gapura/Pengantin di sini nanti */}
        </div>
      </BaseSectionWrapper>


      {/* =================================================================
          SECTION 2: OPENING & QUOTE
         ================================================================= */}
      <BaseSectionWrapper id="opening" className="text-center py-20 font-isi">
        <div className="border border-[#D7CCC8] p-8 rounded-lg relative bg-white/50">
           <p className="relative z-10 text-sm leading-loose italic text-[#5D4037]">
             "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya..."
           </p>
           <p className="relative z-10 text-xs font-bold mt-4 text-[#8D6E63]">(Ar-Rum: 21)</p>
        </div>
      </BaseSectionWrapper>


      {/* =================================================================
          SECTION 3: COUPLE PROFILE
         ================================================================= */}
      <BaseSectionWrapper id="couple" className="text-center py-10 space-y-12">
        <h2 className="font-judul text-xl font-bold text-[#5D4037] mb-10 tracking-widest uppercase">Mempelai</h2>

        {/* GROOM */}
        <div className="mb-12">
          <GalleryFrame 
            frameSrc={`${ASSETS}/03-Section 2/FRAME FOTO.svg`}
            photoSrc="https://via.placeholder.com/300" 
            className="w-32 h-32 mx-auto mb-4"
          />
          <h3 className="font-judul text-2xl font-bold text-[#5D4037]">{invitation.groomName}</h3>
          <p className="font-isi text-sm mt-2 text-[#8D6E63]">Putra Bpk. {invitation.groomFather} & Ibu {invitation.groomMother}</p>
        </div>

        <div className="text-2xl text-[#8D6E63] font-serif">&</div>

        {/* BRIDE */}
        <div className="mb-12">
           <GalleryFrame 
            frameSrc={`${ASSETS}/03-Section 2/FRAME FOTO.svg`}
            photoSrc="https://via.placeholder.com/300"
            className="w-32 h-32 mx-auto mb-4"
          />
          <h3 className="font-judul text-2xl font-bold text-[#5D4037]">{invitation.brideName}</h3>
          <p className="font-isi text-sm mt-2 text-[#8D6E63]">Putri Bpk. {invitation.brideFather} & Ibu {invitation.brideMother}</p>
        </div>
      </BaseSectionWrapper>


      {/* =================================================================
          SECTION 4: EVENT & COUNTDOWN
         ================================================================= */}
      <BaseSectionWrapper id="event" className="text-center py-16 font-isi">
        <div className="bg-[#EFEBE9] rounded-xl p-8 mb-12 shadow-sm border border-[#D7CCC8]">
           <p className="text-xs uppercase tracking-widest mb-4 font-bold text-[#5D4037]">Menuju Hari Bahagia</p>
           <div className="grid grid-cols-4 gap-2">
              <div><span className="text-2xl font-bold block">{timeLeft.days}</span><span className="text-[10px]">Hari</span></div>
              <div><span className="text-2xl font-bold block">{timeLeft.hours}</span><span className="text-[10px]">Jam</span></div>
              <div><span className="text-2xl font-bold block">{timeLeft.minutes}</span><span className="text-[10px]">Menit</span></div>
              <div><span className="text-2xl font-bold block">{timeLeft.seconds}</span><span className="text-[10px]">Detik</span></div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white p-6 rounded-lg border border-[#D7CCC8] shadow-sm relative">
              <h4 className="font-bold text-[#5D4037] mb-2 uppercase tracking-wide">Akad Nikah</h4>
              <p className="text-sm">{new Date(invitation.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-sm">{invitation.eventTime}</p>
              <p className="font-bold text-[#5D4037] mt-4">{invitation.location}</p>
           </div>

           <div className="bg-white p-6 rounded-lg border border-[#D7CCC8] shadow-sm relative">
              <h4 className="font-bold text-[#5D4037] mb-2 uppercase tracking-wide">Resepsi</h4>
              <p className="text-sm">{new Date(invitation.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="text-sm">11:00 WIB - Selesai</p>
              <p className="font-bold text-[#5D4037] mt-4">{invitation.location}</p>
           </div>
        </div>

        <div className="mt-8">
           <a href={invitation.mapUrl || "#"} target="_blank" className="inline-block bg-[#5D4037] text-white px-8 py-3 rounded-full text-sm font-bold shadow hover:bg-[#4E342E] transition-colors">
             Buka Google Maps
           </a>
        </div>
      </BaseSectionWrapper>


      {/* =================================================================
          SECTION 5: LIVE STREAM
         ================================================================= */}
      <BaseSectionWrapper id="live" className="text-center py-10 font-isi">
         <h3 className="font-bold text-[#5D4037] mb-4 uppercase">Live Streaming</h3>
         <div className="w-full aspect-video bg-black rounded-lg mb-6 flex items-center justify-center text-white/50">
            VIDEO PLAYER
         </div>
         <button className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow">
            Tonton di YouTube
         </button>
      </BaseSectionWrapper>


      {/* =================================================================
          SECTION 6: RSVP & WISHES
         ================================================================= */}
      <BaseSectionWrapper id="rsvp" className="text-center py-10 font-isi">
        <h3 className="font-judul font-bold text-[#5D4037] mb-8 uppercase tracking-widest text-xl">Konfirmasi Kehadiran</h3>

        <div className="bg-[#EFEBE9]/50 p-6 rounded-lg border border-[#D7CCC8] text-left space-y-4">
           <div>
              <label className="text-xs font-bold text-[#5D4037] block mb-1">Nama</label>
              <input type="text" className="w-full bg-white border border-[#D7CCC8] rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8D6E63]" placeholder="Nama Anda" />
           </div>
           <div>
              <label className="text-xs font-bold text-[#5D4037] block mb-1">Jumlah Tamu</label>
              <select className="w-full bg-white border border-[#D7CCC8] rounded p-2 text-sm">
                 <option>1 Orang</option>
                 <option>2 Orang</option>
              </select>
           </div>
           <div className="flex gap-2">
              <button className="flex-1 bg-[#8D6E63] text-white py-2 rounded text-sm hover:opacity-90 transition-opacity">Hadir</button>
              <button className="flex-1 bg-gray-300 text-gray-600 py-2 rounded text-sm hover:opacity-90 transition-opacity">Tidak Hadir</button>
           </div>
           <button className="w-full bg-[#5D4037] text-white py-3 rounded font-bold mt-4 shadow-lg hover:bg-[#4E342E] transition-colors">
              Kirim RSVP
           </button>
        </div>

        {/* Wishes List */}
        <div className="mt-12 space-y-4 text-left">
           <h4 className="font-bold text-center text-sm mb-4 tracking-widest uppercase">Doa & Ucapan</h4>
           {invitation.wishes?.map((wish) => (
             <div key={wish.id} className="bg-white p-4 rounded border border-[#D7CCC8] shadow-sm">
                <p className="font-bold text-[#5D4037] text-sm">{wish.guest?.name}</p>
                <p className="text-xs text-gray-600 mt-1">{wish.message}</p>
             </div>
           ))}
        </div>
      </BaseSectionWrapper>


      {/* =================================================================
          SECTION 7: WEDDING GIFT
         ================================================================= */}
      <BaseSectionWrapper id="gift" className="text-center py-10 font-isi">
         <h3 className="font-judul font-bold text-[#5D4037] mb-6 uppercase tracking-widest text-xl">Wedding Gift</h3>
         <p className="text-sm px-4 mb-8 text-[#8D6E63]">Bagi Anda yang ingin memberikan tanda kasih, dapat melalui:</p>

         <div className="border border-[#D7CCC8] rounded-lg p-6 bg-white shadow-sm max-w-xs mx-auto">
            <div className="font-bold text-lg mb-2">BANK BCA</div>
            <p className="text-xl font-mono tracking-widest mb-2 text-[#5D4037]">1234 5678 90</p>
            <p className="text-sm text-gray-500 mb-4">a.n {invitation.groomName}</p>
            <button className="text-xs border border-[#8D6E63] text-[#8D6E63] px-3 py-1 rounded hover:bg-[#8D6E63] hover:text-white transition-colors">
               Salin Rekening
            </button>
         </div>
      </BaseSectionWrapper>


      {/* --- SECTION 8: GALLERY (BENTO GRID FIX) --- */}
        <BaseSectionWrapper id="gallery" className="pb-20 pt-10">
           <img src={`${ASSETS}/09-Section 8/GALLERY.svg`} className="w-40 mx-auto mb-8 block" alt="Gallery" />
           
           <div className="grid grid-cols-2 gap-3 px-4">
              {/* Foto 1 */}
              {invitation.gallery?.[0] && (
                <GalleryFrame 
                  frameSrc={`${ASSETS}/09-Section 8/FOTO POTRAIT.svg`} 
                  photoSrc={invitation.gallery[0]} 
                  className="aspect-[3/4]"
                />
              )}
              {/* Foto 2 */}
              {invitation.gallery?.[1] && (
                <GalleryFrame 
                  frameSrc={`${ASSETS}/09-Section 8/FOTO POTRAIT BESAR.svg`} 
                  photoSrc={invitation.gallery[1]}
                  className="aspect-[3/4]"
                />
              )}
              {/* Foto 3 */}
              {invitation.gallery?.[2] && (
                <GalleryFrame 
                  frameSrc={`${ASSETS}/09-Section 8/FOTO LANDSCAPE.svg`} 
                  photoSrc={invitation.gallery[2]}
                  className="col-span-2 aspect-[16/9]"
                />
              )}
           </div>
        </BaseSectionWrapper>


      {/* =================================================================
          SECTION 9: FOOTER
         ================================================================= */}
      <BaseSectionWrapper id="footer" className="text-center pt-20 pb-10 font-isi">
         <p className="text-sm mb-6 px-8 text-[#5D4037]">
           Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.
         </p>
         <h2 className="font-judul text-2xl font-bold text-[#5D4037] mb-2">
            {invitation.groomNick} & {invitation.brideNick}
         </h2>
         <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-10">
            Designed by Evory
         </div>
      </BaseSectionWrapper>

    </div>
  );
}