"use client";

import { WeddingTemplateProps } from "@/types/template";
import localFont from 'next/font/local';
import Image from "next/image"; // Gunakan next/image untuk foto user
import { useEffect, useState } from "react";
import BaseSectionWrapper from "../../base/BaseSectionWrapper";

// 1. KONFIGURASI FONT (Path disesuaikan agar aman)
// Note: Path di next/font/local relatif terhadap FILE INI
const fontJudul = localFont({
   src: '../../../../public/templates/javanese/jvn-01/fonts/Crimson_Pro/CrimsonPro-VariableFont_wght.ttf',
   variable: '--font-judul',
   display: 'swap'
});

const fontIsi = localFont({
   src: '../../../../public/templates/javanese/jvn-01/fonts/lt_perfume/LTPerfume-2.ttf',
   variable: '--font-isi',
   display: 'swap'
});

// Aset Statis (CDN/Supabase)
const ASSETS = "https://cksyuviluwywysyjcouu.supabase.co/storage/v1/object/public/wedding-assets/system-asset/jvn-01";

// Palet Warna (Bisa dipakai via className juga)
const COLORS = {
   primary: "#5D4037", // Coklat Tua (Teks Utama)
   secondary: "#8D6E63", // Coklat Muda (Aksen)
   paper: "#F1F1E8", // Background Kertas
};

// Komponen Pembantu: Frame Foto
const GalleryFrame = ({ src, alt, className }: { src: string, alt: string, className?: string }) => (
   <div className={`relative overflow-hidden rounded-xl shadow-md bg-stone-200 ${className}`}>
      <Image
         src={src}
         alt={alt}
         fill
         className="object-cover transition-transform duration-700 hover:scale-110"
         sizes="(max-width: 768px) 100vw, 33vw"
      />
   </div>
);

export default function Jvn01({ invitation, guest }: WeddingTemplateProps) {
   const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

   // Countdown Logic
   useEffect(() => {
      const target = new Date(invitation.eventDate).getTime();
      const interval = setInterval(() => {
         const now = new Date().getTime();
         const diff = target - now;
         if (diff > 0) {
            setTimeLeft({
               days: Math.floor(diff / (1000 * 60 * 60 * 24)),
               hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
               minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
               seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
         }
      }, 1000);
      return () => clearInterval(interval);
   }, [invitation.eventDate]);

   return (
      <div className={`${fontIsi.variable} ${fontJudul.variable} font-isi min-h-screen w-full relative bg-stone-900`}>

         {/* --- LAYER 0: GLOBAL BACKGROUND (DESKTOP) --- */}
         <div
            className="fixed inset-0 z-0 hidden lg:block"
            style={{
               backgroundImage: `url('${ASSETS}/WING/BACKGROUND 2.svg')`,
               backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5
            }}
         />

         {/* --- LAYER 1: KERTAS UNDANGAN (MOBILE WRAPPER) --- */}
         <div
            className="relative z-10 w-full lg:w-[480px] lg:ml-auto min-h-screen shadow-2xl transition-all duration-500"
            style={{
               backgroundColor: COLORS.paper,
               backgroundImage: `url('${ASSETS}/01-Cover/PATTERN ATAS BACKGROUND.svg')`,
               backgroundRepeat: 'repeat-y', backgroundSize: '100% auto', backgroundBlendMode: 'multiply'
            }}
         >
            <div className="mx-auto max-w-full overflow-hidden">

               {/* =================================================================
              1. COVER SECTION
              ================================================================= */}
               <BaseSectionWrapper id="cover" className="min-h-screen flex flex-col items-center justify-between relative pt-10 px-6">
                  {/* Dekorasi */}
                  <img src={`${ASSETS}/01-Cover/DAUN KIRI ATAS.svg`} className="absolute top-0 left-0 w-24 md:w-32 z-20 pointer-events-none" alt="" />
                  <img src={`${ASSETS}/01-Cover/DAUN KANAN ATAS.svg`} className="absolute top-0 right-0 w-24 md:w-32 z-20 pointer-events-none" alt="" />

                  {/* Konten Utama */}
                  <div className="z-30 text-center relative mt-12 space-y-4 animate-in fade-in zoom-in duration-1000">
                     <p className="tracking-[0.2em] text-xs uppercase font-bold text-[#8D6E63] mb-2">The Wedding of</p>
                     <div className="space-y-0">
                        <h1 className="font-judul text-5xl md:text-6xl font-bold text-[#5D4037] leading-tight">{invitation.groomNick}</h1>
                        <div className="font-serif text-2xl text-[#8D6E63] my-1">&</div>
                        <h1 className="font-judul text-5xl md:text-6xl font-bold text-[#5D4037] leading-tight">{invitation.brideNick}</h1>
                     </div>

                     <div className="mt-6 py-2 border-y border-[#8D6E63] inline-block px-6">
                        <p className="tracking-widest text-xs font-bold text-[#5D4037] uppercase">
                           {new Date(invitation.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                     </div>

                     {/* Personalized Guest (Jika ada) */}
                     {guest && (
                        <div className="mt-8 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-[#D7CCC8] shadow-sm max-w-xs mx-auto">
                           <p className="text-[10px] uppercase tracking-widest text-[#8D6E63] mb-1">Kepada Yth:</p>
                           <p className="text-lg font-bold text-[#5D4037]">{guest.name}</p>
                           <p className="text-xs text-[#8D6E63] mt-1">{guest?.category || "Tamu Undangan"}</p>
                           <button className="mt-3 bg-[#5D4037] text-white text-xs px-6 py-2 rounded-full shadow hover:bg-[#4E342E] transition">Buka Undangan</button>
                        </div>
                     )}
                  </div>

                  {/* Gambar Wayang Bawah */}
                  <div className="relative w-full h-[300px] flex justify-center items-end mt-auto pointer-events-none">
                     <img src={`${ASSETS}/01-Cover/WAYANG DIATAS GRADIENT.svg`} className="absolute bottom-0 left-0 w-full z-10 opacity-80 mix-blend-multiply" alt="" />
                     <img src={`${ASSETS}/01-Cover/PENGANTIN.svg`} className="relative z-20 h-[80%] object-contain mb-6" alt="" />
                  </div>
               </BaseSectionWrapper>

               {/* =================================================================
              2. AYAT & PEMBUKAAN
              ================================================================= */}
               <BaseSectionWrapper id="opening" className="text-center py-20 px-8 relative">
                  <div className="border-y-2 border-[#D7CCC8] py-8 relative">
                     <p className="text-sm leading-loose italic text-[#5D4037]">"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya..."</p>
                     <p className="text-xs font-bold mt-4 text-[#8D6E63]">(Ar-Rum: 21)</p>
                  </div>
               </BaseSectionWrapper>

               {/* =================================================================
              3. BRIDE & GROOM
              ================================================================= */}
               <BaseSectionWrapper id="couple" className="text-center py-10 px-6 space-y-16 relative">
                  <h2 className="font-judul text-3xl font-bold text-[#5D4037]">Mempelai</h2>

                  {/* Groom */}
                  <div className="flex flex-col items-center space-y-4">
                     <GalleryFrame
                        src={invitation.groomImageUrl || "https://placehold.co/400x400/png?text=Groom"}
                        alt="Groom"
                        className="w-48 h-48 rounded-full border-4 border-[#D7CCC8]"
                     />
                     <div>
                        <h3 className="font-judul text-3xl font-bold text-[#5D4037]">{invitation.groomName}</h3>
                        <p className="text-xs text-[#8D6E63] mt-2 font-bold uppercase tracking-wide">Putra Bpk. {invitation.groomFather} & Ibu {invitation.groomMother}</p>
                     </div>
                  </div>

                  <div className="text-3xl text-[#8D6E63] font-serif">&</div>

                  {/* Bride */}
                  <div className="flex flex-col items-center space-y-4">
                     <GalleryFrame
                        src={invitation.brideImageUrl || "https://placehold.co/400x400/png?text=Bride"}
                        alt="Bride"
                        className="w-48 h-48 rounded-full border-4 border-[#D7CCC8]"
                     />
                     <div>
                        <h3 className="font-judul text-3xl font-bold text-[#5D4037]">{invitation.brideName}</h3>
                        <p className="text-xs text-[#8D6E63] mt-2 font-bold uppercase tracking-wide">Putri Bpk. {invitation.brideFather} & Ibu {invitation.brideMother}</p>
                     </div>
                  </div>
               </BaseSectionWrapper>

               {/* =================================================================
              4. COUNTING DAYS & EVENT DETAIL
              ================================================================= */}
               <BaseSectionWrapper id="event" className="text-center py-20 px-6 bg-[#EFEBE9]/30">
                  <h3 className="font-judul text-2xl font-bold text-[#5D4037] mb-8">Rangkaian Acara</h3>

                  {/* Countdown Box */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-[#D7CCC8] mb-12 max-w-sm mx-auto">
                     <div className="grid grid-cols-4 gap-2 divide-x divide-[#D7CCC8]">
                        <div><span className="text-xl font-bold block text-[#5D4037]">{timeLeft.days}</span><span className="text-[10px] uppercase text-[#8D6E63]">Hari</span></div>
                        <div><span className="text-xl font-bold block text-[#5D4037]">{timeLeft.hours}</span><span className="text-[10px] uppercase text-[#8D6E63]">Jam</span></div>
                        <div><span className="text-xl font-bold block text-[#5D4037]">{timeLeft.minutes}</span><span className="text-[10px] uppercase text-[#8D6E63]">Menit</span></div>
                        <div><span className="text-xl font-bold block text-[#5D4037]">{timeLeft.seconds}</span><span className="text-[10px] uppercase text-[#8D6E63]">Detik</span></div>
                     </div>
                  </div>

                  {/* Event Cards */}
                  <div className="space-y-6">
                     {/* Akad */}
                     <div className="bg-white p-8 rounded-xl border-l-4 border-[#5D4037] shadow-sm relative overflow-hidden">
                        <img src={`${ASSETS}/window.svg`} className="absolute right-[-20px] bottom-[-20px] w-24 opacity-10" alt="" />
                        <h4 className="font-judul text-xl font-bold text-[#5D4037] mb-1">Akad Nikah</h4>
                        <p className="text-sm text-gray-600 mb-4">{new Date(invitation.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-sm font-bold text-[#8D6E63]">{invitation.eventTime} WIB</p>
                        <p className="text-xs text-gray-500 mt-2 max-w-[200px] mx-auto">{invitation.location}</p>
                     </div>

                     {/* Resepsi */}
                     <div className="bg-white p-8 rounded-xl border-l-4 border-[#8D6E63] shadow-sm relative overflow-hidden">
                        <img src={`${ASSETS}/window.svg`} className="absolute right-[-20px] bottom-[-20px] w-24 opacity-10" alt="" />
                        <h4 className="font-judul text-xl font-bold text-[#5D4037] mb-1">Resepsi</h4>
                        <p className="text-sm text-gray-600 mb-4">{new Date(invitation.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-sm font-bold text-[#8D6E63]">11:00 - 13:00 WIB</p>
                        <p className="text-xs text-gray-500 mt-2 max-w-[200px] mx-auto">{invitation.location}</p>
                     </div>
                  </div>

                  <div className="mt-10">
                     <a href={invitation.mapUrl || "#"} target="_blank" className="inline-flex items-center gap-2 bg-[#5D4037] text-white px-8 py-3 rounded-full text-sm font-bold shadow hover:bg-[#4E342E] transition-colors">
                        <span>Lihat Lokasi</span>
                     </a>
                  </div>
               </BaseSectionWrapper>

               {/* =================================================================
              5. LIVE STREAMING
              ================================================================= */}
               <BaseSectionWrapper id="live" className="text-center py-16 px-6">
                  <h3 className="font-judul text-xl font-bold text-[#5D4037] mb-6">Live Streaming</h3>
                  <p className="text-sm text-gray-600 mb-6 px-4">Turut berbahagia dari kejauhan melalui siaran langsung acara kami.</p>

                  <div className="aspect-video w-full bg-black rounded-xl mb-6 relative group overflow-hidden shadow-lg border-4 border-white">
                     <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/50 text-xs uppercase tracking-widest">Video Player Placeholder</span>
                     </div>
                  </div>

                  <button className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow hover:bg-red-700 transition">
                     Tonton di YouTube
                  </button>
               </BaseSectionWrapper>

               {/* =================================================================
              8. LOVE STORY (BARU)
              ================================================================= */}
               <BaseSectionWrapper id="lovestory" className="text-center py-20 px-6 bg-white">
                  <h3 className="font-judul text-2xl font-bold text-[#5D4037] mb-10">Kisah Cinta Kami</h3>
                  <div className="space-y-8 relative">
                     {/* Garis Timeline */}
                     <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#D7CCC8] -translate-x-1/2"></div>

                     {/* Story 1 */}
                     <div className="relative z-10">
                        <div className="bg-[#EFEBE9] p-2 rounded-full inline-block text-xs font-bold text-[#5D4037] mb-2 border border-[#D7CCC8]">2020</div>
                        <h4 className="font-bold text-[#5D4037]">Pertemuan Pertama</h4>
                        <p className="text-xs text-gray-600 px-8 mt-1">Kami bertemu di sebuah kedai kopi kecil di Jakarta Selatan...</p>
                     </div>
                     {/* Story 2 */}
                     <div className="relative z-10">
                        <div className="bg-[#EFEBE9] p-2 rounded-full inline-block text-xs font-bold text-[#5D4037] mb-2 border border-[#D7CCC8]">2023</div>
                        <h4 className="font-bold text-[#5D4037]">Lamaran</h4>
                        <p className="text-xs text-gray-600 px-8 mt-1">Dia memberanikan diri untuk meminta restu kepada orang tua...</p>
                     </div>
                  </div>
               </BaseSectionWrapper>

               {/* =================================================================
              6. RSVP
              ================================================================= */}
               <BaseSectionWrapper id="rsvp" className="text-center py-16 px-6">
                  <h3 className="font-judul font-bold text-[#5D4037] mb-2 text-2xl">Buku Tamu</h3>
                  <p className="text-xs text-gray-500 mb-8">Mohon konfirmasi kehadiran Anda</p>

                  <div className="bg-white p-6 rounded-xl border border-[#D7CCC8] shadow-sm text-left space-y-4">
                     {/* FORM RSVP (Ini nanti perlu di-connect ke Server Action) */}
                     <div>
                        <label className="text-xs font-bold text-[#5D4037] block mb-1">Nama Lengkap</label>
                        <input type="text" className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded p-3 text-sm focus:border-[#8D6E63] outline-none" placeholder="Isi nama Anda..." defaultValue={guest?.name || ""} />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-[#5D4037] block mb-1">Kehadiran</label>
                        <select className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded p-3 text-sm focus:border-[#8D6E63] outline-none">
                           <option value="ATTENDING">Hadir</option>
                           <option value="DECLINED">Berhalangan</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-[#5D4037] block mb-1">Ucapan & Doa</label>
                        <textarea className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded p-3 text-sm focus:border-[#8D6E63] outline-none h-24" placeholder="Tulis ucapan selamat..." />
                     </div>
                     <button className="w-full bg-[#5D4037] text-white py-3 rounded-lg font-bold mt-2 shadow hover:bg-[#4E342E] transition">Kirim Konfirmasi</button>
                  </div>

                  {/* GANTI LOGIC WISHES LIST MENJADI: */}
                  <div className="mt-12 space-y-4 text-left max-h-96 overflow-y-auto pr-2">
                     <h4 className="font-bold text-center text-sm mb-4 tracking-widest uppercase text-[#8D6E63]">Ucapan Terbaru</h4>

                     {/* PERBAIKAN DI SINI: Pakai tanda tanya (?) */}
                     {invitation.wishes && invitation.wishes.length > 0 ? (
                        invitation.wishes.map((wish) => (
                           <div key={wish.id} className="bg-white/50 p-4 rounded-lg border border-[#D7CCC8] shadow-sm">
                              {/* Gunakan optional chaining untuk nama tamu juga */}
                              <p className="font-bold text-[#5D4037] text-sm">{wish.guest?.name || "Tamu"}</p>
                              <p className="text-xs text-gray-600 mt-1 leading-relaxed">"{wish.message}"</p>
                           </div>
                        ))
                     ) : (
                        <p className="text-center text-xs text-gray-400 italic">Belum ada ucapan. Jadilah yang pertama!</p>
                     )}
                  </div>
               </BaseSectionWrapper>

               {/* =================================================================
              7. WEDDING GIFT
              ================================================================= */}
               <BaseSectionWrapper id="gift" className="text-center py-16 px-6 bg-[#EFEBE9]/30">
                  <h3 className="font-judul font-bold text-[#5D4037] mb-6 text-xl">Tanda Kasih</h3>
                  <p className="text-sm px-4 mb-8 text-[#8D6E63]">Doa restu Anda merupakan karunia yang sangat berarti bagi kami.</p>

                  <div className="grid gap-4">
                     {/* Bank Card (Looping nanti dari DB) */}
                     <div className="border border-[#D7CCC8] rounded-xl p-6 bg-white shadow-sm max-w-xs mx-auto w-full">
                        <div className="font-bold text-lg mb-2 text-slate-800">BCA</div>
                        <p className="text-xl font-mono tracking-widest mb-1 text-[#5D4037] select-all">1234567890</p>
                        <p className="text-xs text-gray-500 mb-4 uppercase">a.n {invitation.groomName}</p>
                        <button
                           className="text-xs border border-[#8D6E63] text-[#8D6E63] px-4 py-1.5 rounded-full hover:bg-[#8D6E63] hover:text-white transition"
                           onClick={() => navigator.clipboard.writeText("1234567890")}
                        >
                           Salin No. Rekening
                        </button>
                     </div>
                  </div>
               </BaseSectionWrapper>

               {/* =================================================================
              9. GALLERY
              ================================================================= */}
               <BaseSectionWrapper id="gallery" className="py-20 px-4 relative">
                  <h3 className="font-judul font-bold text-[#5D4037] mb-8 text-center text-2xl">Galeri Foto</h3>
                  <div className="grid grid-cols-2 gap-3">
                     {/* Logic Tampilan Grid: Foto pertama besar, sisanya kecil */}
                     {invitation.gallery?.length > 0 ? (
                        invitation.gallery.map((url, i) => (
                           <GalleryFrame
                              key={i}
                              src={url}
                              alt={`Gallery ${i}`}
                              className={i % 3 === 0 ? "col-span-2 aspect-video" : "aspect-[3/4]"}
                           />
                        ))
                     ) : (
                        <p className="col-span-2 text-center text-xs text-gray-400">Belum ada foto galeri.</p>
                     )}
                  </div>
               </BaseSectionWrapper>

               {/* =================================================================
              10. FOOTER & EVORY LICENSE
              ================================================================= */}
               <BaseSectionWrapper id="footer" className="text-center pt-24 pb-12 font-isi relative bg-[#5D4037] text-[#D7CCC8]">
                  <p className="text-sm mb-8 px-8 opacity-80">Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.</p>
                  <h2 className="font-judul text-3xl font-bold mb-10">{invitation.groomNick} & {invitation.brideNick}</h2>

                  <div className="border-t border-white/10 pt-8 mt-8">
                     <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">Powered By</p>
                     <div className="flex items-center justify-center gap-2 font-bold text-lg tracking-tight">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Evory Platform
                     </div>
                     <p className="text-[9px] mt-4 opacity-30">© 2026 Evory. All Rights Reserved.</p>
                  </div>
               </BaseSectionWrapper>

            </div>
         </div>
      </div>
   );
}