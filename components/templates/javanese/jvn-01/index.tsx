"use client";

import { WeddingTemplateProps } from "@/types/template";
import BaseSectionWrapper from "../../base/BaseSectionWrapper";
import { useEffect, useState } from "react";
import localFont from 'next/font/local';

// 1. KONFIGURASI FONT
// [FIX] Typo 'ssrc' diperbaiki menjadi 'src'
const fontJudul = localFont({
  src: '../../../../public/templates/javanese/jvn-01/fonts/Crimson_Pro/CrimsonPro-VariableFont_wght.ttf', 
  variable: '--font-judul'
});

const fontIsi = localFont({
  src: '../../../../public/templates/javanese/jvn-01/fonts/lt_perfume/LTPerfume-2.ttf',
  variable: '--font-isi'
});

const ASSETS = "https://cksyuviluwywysyjcouu.supabase.co/storage/v1/object/public/wedding-assets/system-asset/jvn-01";

// 2. DEFINISI WARNA
const PALETTE = {
  primary: "#818362",
  secondary: "#AC8E85",
  background: "#F1F1E8", // Warna Kertas
};

// --- KOMPONEN GALLERY FRAME ---
const GalleryFrame = ({ photoSrc, className }: { photoSrc: string, className?: string }) => (
  <div className={`relative overflow-hidden rounded-xl shadow-md bg-gray-200 ${className}`}>
    <img 
      src={photoSrc} 
      alt="Gallery" 
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110" 
    />
  </div>
);

export default function Jvn01({ invitation }: WeddingTemplateProps) {
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
    // WRAPPER UTAMA
    <div className={`${fontIsi.variable} ${fontJudul.variable} font-isi min-h-screen w-full relative`}>

      {/* LAYER 0: GLOBAL WING BACKGROUND (DESKTOP)
         - Fixed: Diam di tempat saat discroll.
         - Inset-0: Memenuhi 1 SATU LAYAR PENUH.
         - Z-0: Paling belakang.
      */}
      <div 
        className="fixed inset-0 z-0 hidden lg:block bg-gray-900"
        style={{ 
          backgroundImage: `url('${ASSETS}/WING/BACKGROUND 2.svg')`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* LAYER 1: KONTEN UNDANGAN (KERTAS)
         - Mobile: w-full (Lebar Penuh).
         - Desktop: 
            * w-[550px]: Lebar kertas fix 550px (Lebih lebar dari sebelumnya 500px).
            * ml-auto: Mendorong kertas mentok ke KANAN.
      */}
      <div 
        className="relative z-10 w-full lg:w-[400px] lg:ml-auto min-h-screen shadow-2xl transition-all duration-500 ease-in-out"
        // FUSION STYLE: Warna Kertas & Pattern diaplikasikan di kolom ini
        style={{ 
            backgroundColor: PALETTE.background, 
            backgroundImage: `url('${ASSETS}/01-Cover/PATTERN ATAS BACKGROUND.svg')`,
            backgroundRepeat: 'repeat-y',
            backgroundSize: '100% auto', // Pattern menyesuaikan lebar kolom kanan
            backgroundPosition: 'top center',
            backgroundBlendMode: 'multiply'
        }} 
      >

        {/* CONTAINER TENGAH 
            - max-w-[550px] agar konten mengikuti lebar kolom kertas baru
        */}
        <div className="mx-auto max-w-[550px]"> 
        
           {/* =================================================================
              SECTION 1: COVER (FULL ASSET INTEGRATION)
              ================================================================= */}
           <BaseSectionWrapper 
              id="cover" 
              className="min-h-screen flex flex-col items-center justify-between relative z-10 pt-10 overflow-hidden"
           >
              
              {/* HIASAN SUDUT */}
              <img src={`${ASSETS}/01-Cover/DAUN KIRI ATAS.svg`} className="absolute top-0 left-0 w-32 md:w-48 z-20 pointer-events-none" alt="" />
              <img src={`${ASSETS}/01-Cover/DAUN KANAN ATAS.svg`} className="absolute top-0 right-0 w-32 md:w-48 z-20 pointer-events-none" alt="" />

              {/* KONTEN TENGAH */}
              <div className="z-30 text-center relative mt-10 space-y-2 flex flex-col items-center">
                 <div className="space-y-1 drop-shadow-sm">
                    <h1 className="font-judul text-4xl md:text-6xl font-bold text-[#5D4037] leading-tight">{invitation.groomNick}</h1>
                    <div className="font-serif text-xl md:text-2xl text-[#8D6E63]">&</div>
                    <h1 className="font-judul text-4xl md:text-6xl font-bold text-[#5D4037] leading-tight">{invitation.brideNick}</h1>
                 </div>
                 <div className="mt-6 px-8 py-2 border-t border-b border-[#8D6E63] inline-block bg-white/40 backdrop-blur-[1px] rounded-full">
                    <p className="tracking-widest text-sm font-isi font-bold text-[#5D4037] uppercase">
                      {new Date(invitation.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                 </div>
              </div>
              
              {/* KOMPOSISI BAWAH */}
              <div className="relative w-full h-[350px] md:h-[450px] flex justify-center items-end mt-auto pointer-events-none w-full">
                 <img src={`${ASSETS}/01-Cover/WAYANG DIATAS GRADIENT.svg`} className="absolute bottom-0 left-0 w-full z-10 opacity-90 mix-blend-multiply object-cover md:object-contain h-full md:h-auto" alt="" />
                 <img src={`${ASSETS}/01-Cover/PENGANTIN.svg`} className="relative z-20 h-[60%] md:h-[65%] object-contain mb-4" alt="" />
              </div>

           </BaseSectionWrapper>

           {/* SECTION 2: OPENING */}
           <BaseSectionWrapper id="opening" className="text-center py-20 font-isi px-6 relative">
             <div className="border border-[#D7CCC8] p-8 rounded-lg relative bg-white/50 backdrop-blur-sm shadow-sm">
                <p className="relative z-10 text-sm leading-loose italic text-[#5D4037]">"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri..."</p>
                <p className="relative z-10 text-xs font-bold mt-4 text-[#8D6E63]">(Ar-Rum: 21)</p>
             </div>
           </BaseSectionWrapper>

           {/* SECTION 3: COUPLE */}
           <BaseSectionWrapper id="couple" className="text-center py-10 space-y-12 relative">
             <h2 className="font-judul text-xl font-bold text-[#5D4037] mb-10 tracking-widest uppercase">Mempelai</h2>
             <div className="mb-12">
               <GalleryFrame photoSrc={invitation.groomImage || "https://via.placeholder.com/300"} className="w-40 h-40 mx-auto mb-4 rounded-full border-4 border-[#D7CCC8]" />
               <h3 className="font-judul text-2xl font-bold text-[#5D4037]">{invitation.groomName}</h3>
               <p className="font-isi text-sm mt-2 text-[#8D6E63]">Putra Bpk. {invitation.groomFather} & Ibu {invitation.groomMother}</p>
             </div>
             <div className="text-2xl text-[#8D6E63] font-serif">&</div>
             <div className="mb-12">
                <GalleryFrame photoSrc={invitation.brideImage || "https://via.placeholder.com/300"} className="w-40 h-40 mx-auto mb-4 rounded-full border-4 border-[#D7CCC8]"/>
               <h3 className="font-judul text-2xl font-bold text-[#5D4037]">{invitation.brideName}</h3>
               <p className="font-isi text-sm mt-2 text-[#8D6E63]">Putri Bpk. {invitation.brideFather} & Ibu {invitation.brideMother}</p>
             </div>
           </BaseSectionWrapper>

           {/* SECTION 4: EVENT */}
           <BaseSectionWrapper id="event" className="text-center py-16 font-isi relative">
             <div className="bg-[#EFEBE9]/80 rounded-xl p-8 mb-12 shadow-sm border border-[#D7CCC8]">
                <p className="text-xs uppercase tracking-widest mb-4 font-bold text-[#5D4037]">Menuju Hari Bahagia</p>
                <div className="grid grid-cols-4 gap-2">
                   <div><span className="text-2xl font-bold block">{timeLeft.days}</span><span className="text-[10px]">Hari</span></div>
                   <div><span className="text-2xl font-bold block">{timeLeft.hours}</span><span className="text-[10px]">Jam</span></div>
                   <div><span className="text-2xl font-bold block">{timeLeft.minutes}</span><span className="text-[10px]">Menit</span></div>
                   <div><span className="text-2xl font-bold block">{timeLeft.seconds}</span><span className="text-[10px]">Detik</span></div>
                </div>
             </div>
             <div className="space-y-6">
                <div className="bg-white/80 p-6 rounded-lg border border-[#D7CCC8] shadow-sm relative">
                   <h4 className="font-bold text-[#5D4037] mb-2 uppercase tracking-wide">Akad Nikah</h4>
                   <p className="text-sm">{new Date(invitation.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   <p className="text-sm">{invitation.eventTime}</p>
                   <p className="font-bold text-[#5D4037] mt-4">{invitation.location}</p>
                </div>
                <div className="bg-white/80 p-6 rounded-lg border border-[#D7CCC8] shadow-sm relative">
                   <h4 className="font-bold text-[#5D4037] mb-2 uppercase tracking-wide">Resepsi</h4>
                   <p className="text-sm">{new Date(invitation.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   <p className="text-sm">11:00 WIB - Selesai</p>
                   <p className="font-bold text-[#5D4037] mt-4">{invitation.location}</p>
                </div>
             </div>
             <div className="mt-8">
                <a href={invitation.mapUrl || "#"} target="_blank" className="inline-block bg-[#5D4037] text-white px-8 py-3 rounded-full text-sm font-bold shadow hover:bg-[#4E342E] transition-colors">Buka Google Maps</a>
             </div>
           </BaseSectionWrapper>

           {/* SECTION 5: LIVE */}
           <BaseSectionWrapper id="live" className="text-center py-10 font-isi relative">
              <h3 className="font-bold text-[#5D4037] mb-4 uppercase">Live Streaming</h3>
              <div className="w-full aspect-video bg-black rounded-lg mb-6 flex items-center justify-center text-white/50">VIDEO PLAYER</div>
              <button className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow">Tonton di YouTube</button>
           </BaseSectionWrapper>

           {/* SECTION 6: RSVP */}
           <BaseSectionWrapper id="rsvp" className="text-center py-10 font-isi relative">
             <h3 className="font-judul font-bold text-[#5D4037] mb-8 uppercase tracking-widest text-xl">Konfirmasi Kehadiran</h3>
             <div className="bg-[#EFEBE9]/80 p-6 rounded-lg border border-[#D7CCC8] text-left space-y-4">
                <div>
                   <label className="text-xs font-bold text-[#5D4037] block mb-1">Nama</label>
                   <input type="text" className="w-full bg-white border border-[#D7CCC8] rounded p-2 text-sm" placeholder="Nama Anda" />
                </div>
                <div>
                   <label className="text-xs font-bold text-[#5D4037] block mb-1">Jumlah Tamu</label>
                   <select className="w-full bg-white border border-[#D7CCC8] rounded p-2 text-sm">
                      <option>1 Orang</option><option>2 Orang</option>
                   </select>
                </div>
                <div className="flex gap-2">
                   <button className="flex-1 bg-[#8D6E63] text-white py-2 rounded text-sm hover:opacity-90 transition-opacity">Hadir</button>
                   <button className="flex-1 bg-gray-300 text-gray-600 py-2 rounded text-sm hover:opacity-90 transition-opacity">Tidak Hadir</button>
                </div>
                <button className="w-full bg-[#5D4037] text-white py-3 rounded font-bold mt-4 shadow-lg">Kirim RSVP</button>
             </div>
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

           {/* SECTION 7: GIFT */}
           <BaseSectionWrapper id="gift" className="text-center py-10 font-isi relative">
              <h3 className="font-judul font-bold text-[#5D4037] mb-6 uppercase tracking-widest text-xl">Wedding Gift</h3>
              <p className="text-sm px-4 mb-8 text-[#8D6E63]">Bagi Anda yang ingin memberikan tanda kasih:</p>
              <div className="border border-[#D7CCC8] rounded-lg p-6 bg-white shadow-sm max-w-xs mx-auto">
                 <div className="font-bold text-lg mb-2">BANK BCA</div>
                 <p className="text-xl font-mono tracking-widest mb-2 text-[#5D4037]">1234 5678 90</p>
                 <p className="text-sm text-gray-500 mb-4">a.n {invitation.groomName}</p>
                 <button className="text-xs border border-[#8D6E63] text-[#8D6E63] px-3 py-1 rounded">Salin Rekening</button>
              </div>
           </BaseSectionWrapper>

           {/* SECTION 8: GALLERY */}
           <BaseSectionWrapper id="gallery" className="pb-20 pt-10 relative">
              <img src={`${ASSETS}/09-Section 8/GALLERY.svg`} className="w-40 mx-auto mb-8 block" alt="Gallery" />
              <div className="grid grid-cols-2 gap-3 px-4">
                 {invitation.gallery?.[0] && <GalleryFrame photoSrc={invitation.gallery[0]} className="aspect-[3/4]" />}
                 {invitation.gallery?.[1] && <GalleryFrame photoSrc={invitation.gallery[1]} className="aspect-[3/4]" />}
                 {invitation.gallery?.[2] && <GalleryFrame photoSrc={invitation.gallery[2]} className="col-span-2 aspect-video" />}
              </div>
           </BaseSectionWrapper>

           {/* SECTION 9: FOOTER */}
           <BaseSectionWrapper id="footer" className="text-center pt-20 pb-10 font-isi relative">
              <p className="text-sm mb-6 px-8 text-[#5D4037]">Terima kasih atas doa restu Anda.</p>
              <h2 className="font-judul text-2xl font-bold text-[#5D4037] mb-2">{invitation.groomNick} & {invitation.brideNick}</h2>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-10">Designed by Evory</div>
           </BaseSectionWrapper>
        
        </div> {/* End Container mx-auto */}
      </div> {/* End Kolom Kanan */}
    </div> // End Wrapper Utama
  );
}