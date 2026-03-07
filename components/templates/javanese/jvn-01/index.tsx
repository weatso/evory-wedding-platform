"use client";

import { submitRsvp } from "@/app/invitation/actions";
import { useAudio } from "@/hooks/useAudio";
import { CalendarCheck, MapPin, Music, Pause, Copy, Heart } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import BaseSectionWrapper from "../../base/BaseSectionWrapper";

// ASSETS SEMENTARA
const ASSETS = "https://cksyuviluwywysyjcouu.supabase.co/storage/v1/object/public/wedding-assets/system-asset/jvn-01";
const R2_PUBLIC_URL = "https://pub-xxxxx.r2.dev"; 

const COLORS = {
   primary: "#818362",
   secondary: "#AC8E85",
   paper: "#F1F1E8",
};

type LoveStory = { year: string; title: string; story: string; };
type DigitalEnvelope = { bankName: string; accountNumber: string; accountHolder: string; qrisUrl?: string; };

const generateGoogleCalendar = (invitation: any) => {
   if (!invitation.eventDate) return "#";
   const date = new Date(invitation.eventDate);
   const start = date.toISOString().replace(/-|:|\.\d+/g, "");
   const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);
   const end = endDate.toISOString().replace(/-|:|\.\d+/g, "");
   return `https://www.google.com/calendar/render?action=TEMPLATE&text=The+Wedding+of+${invitation.groomNick}+%26+${invitation.brideNick}&dates=${start}/${end}&details=Tanpa+mengurangi+rasa+hormat,+kami+mengundang+Bapak/Ibu+untuk+hadir.&location=${invitation.location}&sf=true&output=xml`;
};

const GalleryFrame = ({ src, alt, className }: { src: string, alt: string, className?: string }) => (
   <div className={`relative overflow-hidden rounded-xl shadow-md bg-stone-200 ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover transition-transform duration-700 hover:scale-110" sizes="(max-width: 768px) 100vw, 33vw" unoptimized />
   </div>
);

// PENEGASAN TIPE DATA (Menghindari Error 'guest is never')
export interface Jvn01Props {
  invitation: any;
  guest?: any | null;
}

export default function Jvn01({ invitation, guest }: Jvn01Props) {
   const themeConfig = (invitation as any).themeConfig || {};

   const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
   const [isPending, startTransition] = useTransition();
   
   const [rsvpForm, setRsvpForm] = useState({
      name: guest?.name || "",
      attendance: "ATTENDING",
      message: ""
   });

   const musicUrl = invitation.musicUrl || "/music/javanese/Cinta.mp3";
   const { playing, toggle } = useAudio(musicUrl, 0.3);

   const loveStories = (themeConfig.loveStories as LoveStory[]) || [];
   const envelopes = (themeConfig.digitalEnvelopes as DigitalEnvelope[]) || [];
   const liveStreamUrl = themeConfig.liveStreamUrl || null;
   const wingsBg = themeConfig.desktopBackground || `${ASSETS}/wing/FotoWings.svg`;

   useEffect(() => {
      if (!invitation.eventDate) return;
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

   const handleRsvpSubmit = async () => {
      if (!rsvpForm.name) return alert("Mohon isi nama Anda.");
      startTransition(async () => {
         const result = await submitRsvp(
            invitation.id,
            guest?.id || null, 
            rsvpForm.name,
            rsvpForm.attendance as "ATTENDING" | "DECLINED",
            rsvpForm.message
         );

         if (result.success) {
            alert("Konfirmasi & Ucapan berhasil dikirim! Terima kasih.");
            setRsvpForm(prev => ({ ...prev, message: "" })); 
         } else {
            alert(result.error || "Gagal mengirim data. Silakan coba lagi.");
         }
      });
   };

   const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Berhasil disalin: " + text);
   };

   return (
      <div className="min-h-screen w-full relative bg-[#F1F1E8]" style={{ '--font-isi': '"FontIsiCustom", serif', '--font-judul': '"FontJudulCustom", serif', fontFamily: 'var(--font-isi)' } as React.CSSProperties}>
         <style dangerouslySetInnerHTML={{__html: `
            @font-face { font-family: 'FontIsiCustom'; src: url('${R2_PUBLIC_URL}/fonts/Crimson_Pro/CrimsonPro-VariableFont_wght.ttf') format('truetype'); font-display: swap; }
            @font-face { font-family: 'FontJudulCustom'; src: url('${R2_PUBLIC_URL}/fonts/lt_perfume/LTPerfume-2.ttf') format('truetype'); font-display: swap; }
         `}} />

         <button onClick={toggle} className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-500 border-2 border-white/20 ${playing ? 'bg-[#5D4037] animate-spin-slow' : 'bg-stone-400'}`}>
            {playing ? <Pause className="text-white w-5 h-5" /> : <Music className="text-white w-5 h-5" />}
         </button>

         {/* WINGS (LAYER 0) */}
         <div className="fixed inset-y-0 left-0 z-0 hidden md:block w-[calc(100%-420px)] lg:right-[420px] transition-all duration-700 overflow-hidden bg-[#AC8E85]">
            <div className="hidden xl:block absolute inset-0 w-full h-full">
               <div className="absolute inset-0" style={{ backgroundImage: `url('${wingsBg}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
               <div className="absolute inset-0 z-0 bg-black/20"></div>
               <div className="absolute inset-y-0 top-[10%] left-0 w-full lg:-left-5 lg:w-1/3 z-20 flex flex-col justify-center items-center px-4">
                  <div className="text-center text-[#F1F1E8] drop-shadow-2xl space-y-2">
                     <div className="text-6xl font-isi md:text-7xl xl:text-8xl leading-none">{invitation.groomNick}</div>
                     <div className="text-6xl font-isi ">&</div>
                     <div className="text-6xl font-isi md:text-7xl xl:text-8xl leading-none">{invitation.brideNick}</div>
                  </div>
               </div>
               <div className="absolute top-1/2 right-7 -translate-y-1/2 z-20 flex flex-col items-center justify-center space-y-1">
                  {(() => {
                     const date = new Date(invitation.eventDate || new Date());
                     const dateStyle = "font-judul font-extralight text-[2.5rem] md:text-[2.5rem] text-[#F1F1E8] drop-shadow-lg";
                     const lineStyle = "w-12 h-[2px] bg-[#D7CCC8]/80 rounded-full";
                     return (
                        <>
                           <span className={dateStyle}>{String(date.getDate()).padStart(2, '0')}</span>
                           <div className={lineStyle}></div>
                           <span className={dateStyle}>{String(date.getMonth() + 1).padStart(2, '0')}</span>
                           <div className={lineStyle}></div>
                           <span className={dateStyle}>{String(date.getFullYear()).slice(-2)}</span>
                        </>
                     );
                  })()}
               </div>
               <img src={`${ASSETS}/wing/GradientWings.svg`} className="absolute top-0 left-0 w-full h-full object-cover z-10 pointer-events-none" alt="" />
               <div className="absolute top-[40%] left-[18%] -translate-y-1/2 -translate-x-1/2 z-20 px-4 py-1 bg-[#F1F1E8] rounded-full shadow-lg flex items-center justify-center mix-blend-screen" style={{ marginTop: '-80px' }}>
                  <p className="font-judul font-extrabold text-black uppercase text-xs md:text-sm whitespace-nowrap " style={{ letterSpacing: '0.15em', marginRight: '-0.15em' }}>The Wedding of</p>
               </div>
               <img src={`${ASSETS}/wing/DaunAtasKiriWings.svg`} className="absolute z-10 pointer-events-none opacity-80" style={{ top: '-15vh', left: '-5vw', width: '15vw', height: '15vw' }} alt="" />
               <img src={`${ASSETS}/wing/DaunKiriBawahWings.svg`} className="absolute z-10 pointer-events-none opacity-80" style={{ bottom: '-20vh', left: '-3vw', width: '18vw', height: '18vw' }} alt="" />
               <img src={`${ASSETS}/wing/DaunKananBawahWings.svg`} className="absolute z-10 pointer-events-none opacity-80" style={{ bottom: '-25vh', right: '-5vw', width: '20vw', height: '20vw' }} alt="" />
            </div>
            {/* Tablet Wings view omitted for brevity, keeping your existing code intact logically */}
            <div className="hidden md:flex xl:hidden w-full h-full flex-col justify-center items-center relative z-20 px-8 space-y-12 animate-in fade-in duration-700">
               <div className="bg-[#F1F1E8] px-6 py-2 rounded-full shadow-lg">
                  <p className="font-judul font-extrabold text-black uppercase text-xs tracking-[0.2em]">The Wedding of</p>
               </div>
               <div className="text-center text-[#F1F1E8] drop-shadow-xl space-y-4">
                  <div className="text-6xl font-isi leading-none">{invitation.groomNick}</div>
                  <div className="text-3xl font-isi">&</div>
                  <div className="text-6xl font-isi leading-none">{invitation.brideNick}</div>
               </div>
            </div>
         </div>

         {/* PAPER (LAYER 1) */}
         <div className="relative z-10 w-full max-w-[420px] mx-auto md:mr-0 md:ml-auto min-h-screen shadow-2xl transition-all duration-500 overflow-hidden" style={{ backgroundColor: COLORS.paper, backgroundRepeat: 'repeat-y', backgroundSize: '100% auto', backgroundBlendMode: 'multiply' }}>
            <div className="mx-auto max-w-full overflow-visible pb-10">

               {/* SECTION 1: COVER */}
               <BaseSectionWrapper id="cover" className="min-h-screen relative !px-0 flex flex-col justify-between overflow-hidden md:ml-auto md:mr-0">
                  <div className="absolute inset-0 pointer-events-none z-10">
                     <img src={`${ASSETS}/01-Cover/DAUN KIRI ATAS.svg`} className="absolute top-0 left-0 w-32 md:w-40 z-30" alt="" />
                     <img src={`${ASSETS}/01-Cover/DAUN KANAN ATAS.svg`} className="absolute top-0 right-0 w-32 md:w-40 z-30" alt="" />
                     <img src={`${ASSETS}/01-Cover/GAPURA.svg`} className="absolute top-[35%] left-0 w-full z-20 -translate-y-1/2 scale-[1.1] origin-top" alt="" />
                     <img src={`${ASSETS}/01-Cover/PATTERN ATAS BACKGROUND.svg`} className="absolute top-[40%] left-0 w-full z-15 opacity-80 -translate-y-1/2 scale-[1.5] origin-top" alt="" />
                  </div>

                  <div className="relative z-30 flex flex-col h-full justify-between items-center px-6 py-12">
                     <div className="text-center relative mt-16 space-y-4 animate-in fade-in zoom-in duration-1000">
                        <p className="tracking-[0.2em] text-xs uppercase font-judul font-bold text-[#8D6E63] mb-2">The Wedding of</p>
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

                        {guest && (
                           <div className="mt-8 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-[#D7CCC8] shadow-sm max-w-xs mx-auto animate-in slide-in-from-bottom-5">
                              <p className="text-[10px] uppercase tracking-widest text-[#8D6E63] mb-1">Kepada Yth:</p>
                              <p className="text-lg font-bold text-[#5D4037]">{guest.name}</p>
                              <p className="text-xs text-[#8D6E63] mt-1">{guest.category || "Tamu Undangan"}</p>
                              <button onClick={() => document.getElementById('opening')?.scrollIntoView({ behavior: 'smooth' })} className="mt-3 bg-[#5D4037] text-white text-xs px-6 py-2 rounded-full shadow hover:bg-[#4E342E] transition">Buka Undangan</button>
                           </div>
                        )}
                     </div>
                     <div className="h-[300px]"></div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none z-10 flex flex-col justify-end">
                     <div className="relative w-full h-full">
                        <img src={`${ASSETS}/01-Cover/WAYANG DIATAS GRADIENT.svg`} className="absolute bottom-[20%] left-0 w-full z-16 opacity-80 mix-blend-multiply scale-[1.5] origin-bottom" alt="" />
                        <div className="absolute bottom-0 left-0 w-full h-[80%] flex justify-center items-end z-17 pb-6">
                           {invitation.coverImageUrl ? (
                              <img src={invitation.coverImageUrl} className="h-[90%] w-auto object-contain rounded-t-full mask-image-bottom" style={{ maskImage: 'linear-gradient(to top, transparent 5%, black 40%)', WebkitMaskImage: 'linear-gradient(to top, transparent 5%, black 40%)' }} alt="Cover Pasangan" />
                           ) : (
                              <img src={`${ASSETS}/01-Cover/PENGANTIN.svg`} className="h-full object-contain" alt="Ilustrasi" />
                           )}
                        </div>
                        <img src={`${ASSETS}/01-Cover/GRADIENT DIATAS BUNGA KECIL.svg`} className="absolute bottom-0 left-0 w-full z-40 opacity-100 object-cover h-[50%]" alt="" />
                        <img src={`${ASSETS}/01-Cover/GRADIENT DIATAS BUNGA KECIL.svg`} className="absolute bottom-0 left-0 w-full z-50 opacity-70 object-cover h-[30%]" alt="" />
                     </div>
                  </div>
               </BaseSectionWrapper>

               {/* SECTION 2: OPENING */}
               <BaseSectionWrapper id="opening" className="text-center py-20 px-8 relative md:ml-auto md:mr-0">
                  <div className="border-y-2 border-[#D7CCC8] py-8 relative">
                     <p className="text-sm leading-loose italic text-[#5D4037]">"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri..."</p>
                     <p className="text-xs font-bold mt-4 text-[#8D6E63]">(Ar-Rum: 21)</p>
                  </div>
               </BaseSectionWrapper>

               {/* SECTION 3: COUPLE */}
               <BaseSectionWrapper id="couple" className="text-center py-10 px-6 space-y-16 relative md:ml-auto md:mr-0">
                  <h2 className="font-judul text-3xl font-bold text-[#5D4037]">Mempelai</h2>
                  <div className="flex flex-col items-center space-y-4">
                     <GalleryFrame src={invitation.groomImageUrl || "https://placehold.co/400x400/png?text=Groom"} alt="Groom" className="w-48 h-48 rounded-full border-4 border-[#D7CCC8]" />
                     <div>
                        <h3 className="font-judul text-3xl font-bold text-[#5D4037]">{invitation.groomName}</h3>
                        <p className="text-xs text-[#8D6E63] mt-2 font-bold uppercase tracking-wide">
                           Putra Bpk. {invitation.groomFather || "..."} <br /> & Ibu {invitation.groomMother || "..."}
                        </p>
                     </div>
                  </div>
                  <div className="text-3xl text-[#8D6E63] font-serif">&</div>
                  <div className="flex flex-col items-center space-y-4">
                     <GalleryFrame src={invitation.brideImageUrl || "https://placehold.co/400x400/png?text=Bride"} alt="Bride" className="w-48 h-48 rounded-full border-4 border-[#D7CCC8]" />
                     <div>
                        <h3 className="font-judul text-3xl font-bold text-[#5D4037]">{invitation.brideName}</h3>
                        <p className="text-xs text-[#8D6E63] mt-2 font-bold uppercase tracking-wide">
                           Putri Bpk. {invitation.brideFather || "..."} <br /> & Ibu {invitation.brideMother || "..."}
                        </p>
                     </div>
                  </div>
               </BaseSectionWrapper>

               {/* SECTION 4: EVENT */}
               <BaseSectionWrapper id="event" className="text-center py-20 px-6 bg-[#EFEBE9]/30 md:ml-auto md:mr-0">
                  <h3 className="font-judul text-2xl font-bold text-[#5D4037] mb-8">Rangkaian Acara</h3>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-[#D7CCC8] mb-12 max-w-sm mx-auto">
                     <div className="grid grid-cols-4 gap-2 divide-x divide-[#D7CCC8]">
                        <div><span className="text-xl font-bold block text-[#5D4037]">{timeLeft.days}</span><span className="text-[10px] uppercase text-[#8D6E63]">Hari</span></div>
                        <div><span className="text-xl font-bold block text-[#5D4037]">{timeLeft.hours}</span><span className="text-[10px] uppercase text-[#8D6E63]">Jam</span></div>
                        <div><span className="text-xl font-bold block text-[#5D4037]">{timeLeft.minutes}</span><span className="text-[10px] uppercase text-[#8D6E63]">Menit</span></div>
                        <div><span className="text-xl font-bold block text-[#5D4037]">{timeLeft.seconds}</span><span className="text-[10px] uppercase text-[#8D6E63]">Detik</span></div>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="bg-white p-8 rounded-xl border-l-4 border-[#5D4037] shadow-sm relative overflow-hidden">
                        <img src={`${ASSETS}/window.svg`} className="absolute right-[-20px] bottom-[-20px] w-24 opacity-10" alt="" />
                        <h4 className="font-judul text-xl font-bold text-[#5D4037] mb-1">Acara Pernikahan</h4>
                        <p className="text-sm text-gray-600 mb-4">{new Date(invitation.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-sm font-bold text-[#8D6E63]">{invitation.eventTime || "08:00 WIB - Selesai"}</p>
                        <p className="text-xs text-gray-500 mt-2 max-w-[200px] mx-auto">{invitation.location}</p>
                     </div>
                  </div>
                  <div className="mt-10 flex flex-col gap-3 justify-center items-center">
                     <a href={invitation.mapUrl || "#"} target="_blank" className="w-full max-w-xs inline-flex justify-center items-center gap-2 bg-[#5D4037] text-white px-6 py-3 rounded-full text-sm font-bold shadow hover:bg-[#4E342E] transition-colors">
                        <MapPin className="w-4 h-4" /> Lihat Lokasi Peta
                     </a>
                     <a href={generateGoogleCalendar(invitation)} target="_blank" className="w-full max-w-xs inline-flex justify-center items-center gap-2 bg-white text-[#5D4037] border border-[#5D4037] px-6 py-3 rounded-full text-sm font-bold shadow hover:bg-stone-50 transition-colors">
                        <CalendarCheck className="w-4 h-4" /> Simpan Tanggal
                     </a>
                  </div>
               </BaseSectionWrapper>

               {/* SECTION 5: LOVE STORY */}
               {loveStories.length > 0 && (
                  <BaseSectionWrapper id="lovestory" className="text-center py-20 px-6 bg-white md:ml-auto md:mr-0">
                     <h3 className="font-judul text-2xl font-bold text-[#5D4037] mb-10">Kisah Cinta Kami</h3>
                     <div className="space-y-8 relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#D7CCC8] -translate-x-1/2"></div>
                        {loveStories.map((story, idx) => (
                           <div key={idx} className="relative z-10 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 200}ms` }}>
                              <div className="bg-[#EFEBE9] p-2 rounded-full inline-block text-xs font-bold text-[#5D4037] mb-2 border border-[#D7CCC8]">{story.year}</div>
                              <h4 className="font-bold text-[#5D4037]">{story.title}</h4>
                              <p className="text-xs text-gray-600 px-8 mt-1 leading-relaxed">{story.story}</p>
                           </div>
                        ))}
                     </div>
                  </BaseSectionWrapper>
               )}

               {/* SECTION 6: LIVE STREAM */}
               {liveStreamUrl && (
                  <BaseSectionWrapper id="live" className="text-center py-16 px-6 md:ml-auto md:mr-0">
                     <h3 className="font-judul text-xl font-bold text-[#5D4037] mb-6">Live Streaming</h3>
                     <div className="aspect-video w-full bg-black rounded-xl mb-6 relative overflow-hidden shadow-lg border-4 border-white">
                        <iframe src={liveStreamUrl.replace("watch?v=", "embed/")} className="absolute inset-0 w-full h-full" allowFullScreen></iframe>
                     </div>
                  </BaseSectionWrapper>
               )}

               {/* SECTION 7: RSVP (GUEST ONLY) */}
               <BaseSectionWrapper id="rsvp" className="text-center py-16 px-6 md:ml-auto md:mr-0">
                  <h3 className="font-judul font-bold text-[#5D4037] mb-2 text-2xl">Buku Tamu</h3>
                  
                  {guest ? (
                     <div className="bg-white p-6 rounded-xl border border-[#D7CCC8] shadow-sm text-left space-y-4">
                        <div>
                           <label className="text-xs font-bold text-[#5D4037] block mb-1">Nama Lengkap</label>
                           <input type="text" className="w-full bg-[#EFEBE9] border border-[#D7CCC8] rounded p-3 text-sm focus:outline-none text-slate-500 font-bold" value={guest.name} readOnly disabled />
                           <p className="text-[10px] text-amber-600 mt-1">*Nama Anda sudah tercatat dari undangan ini.</p>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-[#5D4037] block mb-1">Kehadiran</label>
                           <select className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded p-3 text-sm focus:border-[#8D6E63] outline-none" value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}>
                              <option value="ATTENDING">Hadir</option>
                              <option value="DECLINED">Berhalangan</option>
                           </select>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-[#5D4037] block mb-1">Ucapan & Doa</label>
                           <textarea className="w-full bg-[#FAFAFA] border border-[#E0E0E0] rounded p-3 text-sm focus:border-[#8D6E63] outline-none h-24" placeholder="Tulis ucapan selamat..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })} />
                        </div>
                        <button onClick={handleRsvpSubmit} disabled={isPending} className="w-full bg-[#5D4037] text-white py-3 rounded-lg font-bold mt-2 shadow hover:bg-[#4E342E] transition disabled:opacity-50">
                           {isPending ? "Mengirim..." : "Kirim Konfirmasi"}
                        </button>
                     </div>
                  ) : (
                     <div className="bg-white p-6 rounded-xl border border-[#D7CCC8] shadow-sm text-center mb-6">
                        <p className="text-sm text-[#8D6E63] italic">
                           Fitur konfirmasi kehadiran (RSVP) hanya tersedia melalui tautan undangan personal.
                        </p>
                     </div>
                  )}

                  <div className="mt-12 space-y-4 text-left max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                     <h4 className="font-bold text-center text-sm mb-4 tracking-widest uppercase text-[#8D6E63]">Ucapan & Doa</h4>
                     {(invitation as any).wishes && (invitation as any).wishes.length > 0 ? (
                        (invitation as any).wishes.map((wish: any) => (
                           <div key={wish.id} className="bg-white/50 p-4 rounded-lg border border-[#D7CCC8] shadow-sm animate-in fade-in slide-in-from-bottom-2">
                              <p className="font-bold text-[#5D4037] text-sm flex items-center gap-2">
                                 {wish.senderName || wish.guest?.name}
                                 {wish.guest?.category && <span className="bg-[#D7CCC8] text-[#5D4037] px-2 py-0.5 rounded-full text-[9px]">{wish.guest.category}</span>}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 leading-relaxed font-serif">"{wish.message}"</p>
                           </div>
                        ))
                     ) : (
                        <p className="text-center text-xs text-gray-400 italic">Belum ada ucapan.</p>
                     )}
                  </div>
               </BaseSectionWrapper>

               {/* SECTION 8: GIFT (PUBLIK BISA MELIHAT SESUAI REQUEST) */}
               {envelopes.length > 0 && (
                  <BaseSectionWrapper id="gift" className="text-center py-16 px-6 bg-[#EFEBE9]/30 md:ml-auto md:mr-0">
                     <h3 className="font-judul font-bold text-[#5D4037] mb-6 text-xl">Tanda Kasih</h3>
                     <p className="text-sm text-slate-600 mb-8 leading-relaxed max-w-xs mx-auto">Doa restu Anda merupakan karunia yang sangat berarti bagi kami.</p>
                     
                     <div className="space-y-6">
                        {envelopes.map((env, idx) => (
                           <div key={idx} className="border border-[#D7CCC8] rounded-xl p-6 bg-white shadow-sm max-w-xs mx-auto w-full relative overflow-hidden">
                              <Heart className="absolute top-[-20px] right-[-20px] w-24 h-24 text-[#EFEBE9] opacity-50" />
                              <div className="relative z-10">
                                 <div className="font-bold text-lg mb-2 text-slate-800">{env.bankName}</div>
                                 <p className="text-xl font-mono tracking-widest mb-1 text-[#5D4037] select-all">{env.accountNumber}</p>
                                 <p className="text-xs text-gray-500 mb-4 uppercase">a.n {env.accountHolder}</p>
                                 
                                 {env.qrisUrl && (
                                    <div className="mb-4 flex justify-center">
                                       <img src={env.qrisUrl} alt="QRIS" className="w-40 h-40 object-contain rounded-lg border p-2 bg-white" />
                                    </div>
                                 )}
                                 
                                 <button 
                                    className="w-full flex items-center justify-center gap-2 text-xs border border-[#8D6E63] text-[#8D6E63] px-4 py-2 rounded-full hover:bg-[#8D6E63] hover:text-white transition" 
                                    onClick={() => handleCopy(env.accountNumber)}
                                 >
                                    <Copy className="w-3.5 h-3.5" /> Salin Rekening
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </BaseSectionWrapper>
               )}

               {/* SECTION 9: GALLERY */}
               <BaseSectionWrapper id="gallery" className="py-20 px-4 relative md:ml-auto md:mr-0">
                  <h3 className="font-judul font-bold text-[#5D4037] mb-8 text-center text-2xl">Galeri Foto</h3>
                  <div className="grid grid-cols-2 gap-3">
                     {invitation.gallery?.length > 0 ? (
                        invitation.gallery.map((url: string, i: number) => (
                           <GalleryFrame key={i} src={url} alt={`Gallery ${i}`} className={i % 3 === 0 ? "col-span-2 aspect-video" : "aspect-[3/4]"} />
                        ))
                     ) : (
                        <p className="col-span-2 text-center text-xs text-gray-400">Belum ada foto galeri.</p>
                     )}
                  </div>
               </BaseSectionWrapper>

               {/* SECTION 10: FOOTER */}
               <BaseSectionWrapper id="footer" className="text-center pt-24 pb-12 font-isi relative bg-[#5D4037] text-[#D7CCC8] md:ml-auto md:mr-0">
                  <p className="text-sm mb-8 px-8 opacity-80">Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu berkenan hadir.</p>
                  <h2 className="font-judul text-3xl font-bold mb-10">{invitation.groomNick} & {invitation.brideNick}</h2>
                  <div className="border-t border-white/10 pt-8 mt-8">
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