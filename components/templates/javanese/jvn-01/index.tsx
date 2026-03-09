"use client";

import { Music, Pause, Heart } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import BaseSectionWrapper from "../../base/BaseSectionWrapper";
import BaseSplash from "../../base/BaseSplash";
import BaseCouple from "../../base/BaseCouple";
import BaseEvent from "../../base/BaseEvent";
import BaseLoveStory from "../../base/BaseLoveStory";
import BaseLiveStream from "../../base/BaseLiveStream";
import BaseRsvp from "../../base/BaseRSVP";
import BaseGift from "../../base/BaseGift";
import BaseGallery from "../../base/BaseGallery";

// ASSETS SEMENTARA DARI CLOUD LAMA (SEGERA PINDAHKAN KE R2 ANDA)
const ASSETS = "https://cksyuviluwywysyjcouu.supabase.co/storage/v1/object/public/wedding-assets/system-asset/jvn-01";
const R2_PUBLIC_URL = "https://pub-xxxxx.r2.dev"; 

const COLORS = {
   primary: "#818362",
   secondary: "#AC8E85",
   paper: "#F1F1E8",
};

export interface Jvn01Props {
  invitation: any;
  guest?: any | null;
}

export default function Jvn01({ invitation, guest }: Jvn01Props) {
   const themeConfig = invitation?.themeConfig || {};
   const musicUrl = invitation?.musicUrl || "/music/javanese/Cinta.mp3";
   const { playing, toggle } = useAudio(musicUrl, 0.3);

   const loveStories = themeConfig.loveStories || [];
   const envelopes = themeConfig.digitalEnvelopes || [];
   const liveStreamUrl = themeConfig.liveStreamUrl || null;
   const wingsBg = themeConfig.desktopBackground || `${ASSETS}/wing/FotoWings.svg`;

   return (
      <div className="min-h-[100dvh] w-full relative bg-[#F1F1E8]" style={{ '--font-isi': '"FontIsiCustom", serif', '--font-judul': '"FontJudulCustom", serif', fontFamily: 'var(--font-isi)' } as React.CSSProperties}>
         {/* INJEKSI FONT */}
         <style dangerouslySetInnerHTML={{__html: `
            @font-face { font-family: 'FontIsiCustom'; src: url('${R2_PUBLIC_URL}/fonts/Crimson_Pro/CrimsonPro-VariableFont_wght.ttf') format('truetype'); font-display: swap; }
            @font-face { font-family: 'FontJudulCustom'; src: url('${R2_PUBLIC_URL}/fonts/lt_perfume/LTPerfume-2.ttf') format('truetype'); font-display: swap; }
         `}} />

         {/* TOMBOL MUSIK MENGAMBANG */}
         <button onClick={toggle} className={`fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-500 border-2 border-white/20 ${playing ? 'bg-[#5D4037] animate-spin-slow' : 'bg-stone-400'}`}>
            {playing ? <Pause className="text-white w-5 h-5" /> : <Music className="text-white w-5 h-5" />}
         </button>

         {/* LAYER 0: WINGS (SAYAP DESKTOP - Terpotong otomatis jika layar kecil) */}
         <div className="fixed inset-y-0 left-0 z-0 hidden md:block w-[calc(100%-420px)] lg:right-[420px] transition-all duration-700 overflow-hidden bg-[#AC8E85]">
            <div className="hidden xl:block absolute inset-0 w-full h-full">
               <div className="absolute inset-0" style={{ backgroundImage: `url('${wingsBg}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
               <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-sm"></div>
               <div className="absolute inset-y-0 top-[10%] left-0 w-full lg:-left-5 lg:w-1/3 z-20 flex flex-col justify-center items-center px-4">
                  <div className="text-center text-[#F1F1E8] drop-shadow-2xl space-y-2">
                     <div className="text-6xl font-isi md:text-7xl xl:text-8xl leading-none">{invitation.groomNick}</div>
                     <div className="text-6xl font-isi ">&</div>
                     <div className="text-6xl font-isi md:text-7xl xl:text-8xl leading-none">{invitation.brideNick}</div>
                  </div>
               </div>
               {/* Ornamen Sayap */}
               <img src={`${ASSETS}/wing/GradientWings.svg`} className="absolute top-0 left-0 w-full h-full object-cover z-10 pointer-events-none" alt="" />
               <img src={`${ASSETS}/wing/DaunAtasKiriWings.svg`} className="absolute z-10 pointer-events-none opacity-80" style={{ top: '-15vh', left: '-5vw', width: '15vw', height: '15vw' }} alt="" />
               <img src={`${ASSETS}/wing/DaunKiriBawahWings.svg`} className="absolute z-10 pointer-events-none opacity-80" style={{ bottom: '-20vh', left: '-3vw', width: '18vw', height: '18vw' }} alt="" />
               <img src={`${ASSETS}/wing/DaunKananBawahWings.svg`} className="absolute z-10 pointer-events-none opacity-80" style={{ bottom: '-25vh', right: '-5vw', width: '20vw', height: '20vw' }} alt="" />
            </div>
         </div>

         {/* LAYER 1: PAPER (KANVAS UTAMA 420px) */}
         <div className="relative z-10 w-full max-w-[420px] mx-auto md:mr-0 md:ml-auto min-h-screen shadow-2xl transition-all duration-500 overflow-hidden" style={{ backgroundColor: COLORS.paper, backgroundRepeat: 'repeat-y', backgroundSize: '100% auto', backgroundBlendMode: 'multiply' }}>
            
            {/* 00: SPLASH SCREEN (Amplop Digital Pembuka) */}
            <BaseSplash 
              guestName={guest?.name}
              guestCategory={guest?.category}
              onOpen={toggle} 
              styles={{
                wrapper: "bg-[#5D4037]",
                overlay: "bg-black/40",
                introText: "text-[10px] tracking-[0.2em] uppercase text-[#D7CCC8]",
                guestNameText: "font-judul text-5xl text-white",
                guestCategoryText: "mt-2 px-4 py-1 bg-[#D7CCC8]/20 text-[#D7CCC8] text-[10px] rounded-full border border-[#D7CCC8]/30",
                button: "inline-flex items-center gap-2 bg-[#D7CCC8] text-[#5D4037] px-8 py-3 rounded-full text-sm font-bold shadow-lg hover:bg-white transition-colors"
              }}
              background={<img src={`${ASSETS}/01-Cover/PENGANTIN.svg`} className="w-full h-full object-cover opacity-30" alt="Splash Background" />}
            />

            {/* 01: COVER */}
            <BaseSectionWrapper id="cover" className="min-h-screen relative !px-0 flex flex-col justify-between overflow-hidden">
               <div className="absolute inset-0 pointer-events-none z-10">
                  <img src={`${ASSETS}/01-Cover/DAUN KIRI ATAS.svg`} className="absolute top-0 left-0 w-32 md:w-40 z-30" alt="" />
                  <img src={`${ASSETS}/01-Cover/DAUN KANAN ATAS.svg`} className="absolute top-0 right-0 w-32 md:w-40 z-30" alt="" />
                  <img src={`${ASSETS}/01-Cover/GAPURA.svg`} className="absolute top-[35%] left-0 w-full z-20 -translate-y-1/2 scale-[1.1] origin-top" alt="" />
               </div>

               <div className="relative z-30 flex flex-col h-full justify-start items-center px-6 py-24">
                  <div className="text-center relative space-y-4 animate-in fade-in zoom-in duration-1000">
                     <p className="tracking-[0.2em] text-xs uppercase font-judul font-bold text-[#8D6E63] mb-2">The Wedding of</p>
                     <div className="space-y-0">
                        <h1 className="font-judul text-5xl md:text-6xl font-bold text-[#5D4037] leading-tight">{invitation.groomNick}</h1>
                        <div className="font-serif text-2xl text-[#8D6E63] my-1">&</div>
                        <h1 className="font-judul text-5xl md:text-6xl font-bold text-[#5D4037] leading-tight">{invitation.brideNick}</h1>
                     </div>
                     <div className="mt-6 py-2 border-y border-[#8D6E63] inline-block px-6">
                        <p className="tracking-widest text-xs font-bold text-[#5D4037] uppercase">
                           {invitation.eventDate ? new Date(invitation.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="absolute inset-x-0 bottom-0 h-[60%] pointer-events-none z-10 flex flex-col justify-end">
                  <div className="relative w-full h-full">
                     <img src={`${ASSETS}/01-Cover/WAYANG DIATAS GRADIENT.svg`} className="absolute bottom-[20%] left-0 w-full z-16 opacity-80 mix-blend-multiply scale-[1.5] origin-bottom" alt="" />
                     <div className="absolute bottom-0 left-0 w-full h-[80%] flex justify-center items-end z-17 pb-6">
                        <img src={invitation.coverImageUrl || `${ASSETS}/01-Cover/PENGANTIN.svg`} className="h-[90%] w-auto object-contain rounded-t-full mask-image-bottom" style={{ maskImage: 'linear-gradient(to top, transparent 5%, black 40%)' }} alt="Cover" />
                     </div>
                     <img src={`${ASSETS}/01-Cover/GRADIENT DIATAS BUNGA KECIL.svg`} className="absolute bottom-0 left-0 w-full z-40 opacity-100 object-cover h-[50%]" alt="" />
                  </div>
               </div>
            </BaseSectionWrapper>

            {/* 02: OPENING */}
            <BaseSectionWrapper id="opening" className="text-center py-20 px-8 relative">
               <div className="border-y-2 border-[#D7CCC8] py-8 relative">
                  <p className="text-sm leading-loose italic text-[#5D4037]">"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri..."</p>
                  <p className="text-xs font-bold mt-4 text-[#8D6E63]">(Ar-Rum: 21)</p>
               </div>
            </BaseSectionWrapper>

            {/* 03: COUPLE (Menggunakan Base Component) */}
            <BaseSectionWrapper id="couple" className="text-center py-10 px-6 relative">
               <BaseCouple 
                 invitation={invitation}
                 styles={{
                   title: "font-judul text-3xl font-bold text-[#5D4037] mb-12",
                   coupleContainer: "flex flex-col items-center space-y-12",
                   imageFrame: "relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#D7CCC8] shadow-lg",
                   nameText: "font-judul text-3xl font-bold text-[#5D4037] mt-4",
                   parentText: "text-xs text-[#8D6E63] mt-2 font-bold uppercase tracking-wide",
                   divider: "text-4xl text-[#8D6E63] font-serif opacity-50"
                 }}
               />
            </BaseSectionWrapper>

            {/* 04: EVENT & COUNTDOWN (Menggunakan Base Component) */}
            <BaseSectionWrapper id="event" className="text-center py-20 px-6 bg-[#EFEBE9]/30 border-y border-[#D7CCC8]/50">
               <BaseEvent 
                  invitation={invitation}
                  styles={{
                     title: "font-judul text-2xl font-bold text-[#5D4037] mb-8",
                     countdownBox: "bg-white p-6 rounded-xl shadow-sm border border-[#D7CCC8] max-w-sm mx-auto mb-12",
                     countdownNumber: "text-2xl font-bold block text-[#5D4037]",
                     countdownLabel: "text-[10px] uppercase text-[#8D6E63] font-bold tracking-widest mt-1 block",
                     eventCard: "bg-white p-8 rounded-xl border-l-4 border-[#5D4037] shadow-sm relative overflow-hidden text-left mb-8",
                     eventTitle: "font-judul text-xl font-bold text-[#5D4037] mb-2",
                     eventDate: "text-sm text-gray-600 mb-4 border-b pb-4",
                     eventTime: "text-sm font-bold text-[#8D6E63]",
                     eventLocation: "text-xs text-gray-500 mt-2 leading-relaxed",
                     buttonGroup: "flex flex-col gap-3 justify-center items-center mt-8",
                     buttonMap: "w-full max-w-xs inline-flex justify-center items-center gap-2 bg-[#5D4037] text-white px-6 py-4 rounded-full text-sm font-bold shadow-lg hover:bg-[#4E342E] transition-colors",
                     buttonCalendar: "w-full max-w-xs inline-flex justify-center items-center gap-2 bg-white text-[#5D4037] border-2 border-[#5D4037] px-6 py-4 rounded-full text-sm font-bold shadow hover:bg-stone-50 transition-colors"
                  }}
                  ornaments={<img src={`${ASSETS}/window.svg`} className="absolute right-[-20px] bottom-[-20px] w-32 opacity-10 pointer-events-none" alt="" />}
               />
            </BaseSectionWrapper>

            {/* 05: LOVE STORY */}
            <BaseSectionWrapper id="lovestory" className="text-center py-20 px-6 bg-white">
               <BaseLoveStory 
                 stories={loveStories}
                 styles={{
                   mainTitle: "font-judul text-2xl font-bold text-[#5D4037]",
                   timelineContainer: "space-y-10 relative mt-12",
                   timelineLine: "absolute left-1/2 top-0 bottom-0 w-px bg-[#D7CCC8] -translate-x-1/2",
                   yearBadge: "bg-[#EFEBE9] px-4 py-2 rounded-full inline-block text-xs font-bold text-[#5D4037] mb-4 border border-[#D7CCC8] shadow-sm",
                   itemTitle: "font-bold text-[#5D4037] text-lg",
                   itemText: "text-xs text-gray-600 px-8 mt-2 leading-relaxed font-serif"
                 }}
               />
            </BaseSectionWrapper>

            {/* 06: LIVE STREAM */}
            <BaseSectionWrapper id="live" className="text-center py-16 px-6">
               <BaseLiveStream 
                 streamUrl={liveStreamUrl}
                 styles={{
                   title: "font-judul text-xl font-bold text-[#5D4037] mb-8",
                   videoContainer: "aspect-video w-full bg-black rounded-xl relative overflow-hidden shadow-lg border-4 border-[#D7CCC8]"
                 }}
               />
            </BaseSectionWrapper>

            {/* 07: RSVP & UCAPAN */}
            <BaseSectionWrapper id="rsvp" className="text-center py-16 px-6 bg-[#EFEBE9]/30 border-y border-[#D7CCC8]/50">
               <h3 className="font-judul font-bold text-[#5D4037] mb-8 text-2xl">Buku Tamu</h3>
               <BaseRsvp 
                  invitationId={invitation.id}
                  guest={guest}
                  wishes={invitation.wishes || []}
                  styles={{
                     formWrapper: "bg-white p-6 rounded-xl border border-[#D7CCC8] shadow-sm text-left",
                     label: "text-xs font-bold text-[#5D4037] uppercase tracking-wider mb-2",
                     input: "bg-[#FAFAFA] border border-[#E0E0E0] text-sm text-slate-700 focus:border-[#8D6E63] rounded-lg",
                     button: "bg-[#5D4037] text-white shadow-lg hover:bg-[#4E342E] py-4 rounded-lg mt-4",
                     wishTitle: "font-bold text-sm tracking-widest text-[#8D6E63]",
                     wishCard: "bg-white/70 p-4 rounded-xl border border-[#D7CCC8] shadow-sm mb-3",
                     wishName: "font-bold text-[#5D4037] text-sm",
                     wishText: "text-xs text-gray-600 mt-2 leading-relaxed font-serif italic",
                     badge: "bg-[#D7CCC8]/30 text-[#5D4037] border border-[#D7CCC8] px-2 py-0.5 rounded-full text-[9px]"
                  }}
               />
            </BaseSectionWrapper>

            {/* 08: GIFT (TANDA KASIH) */}
            <BaseSectionWrapper id="gift" className="text-center py-20 px-6">
               <BaseGift 
                 envelopes={envelopes}
                 guest={guest}
                 styles={{
                   title: "font-judul font-bold text-[#5D4037] mb-4 text-2xl",
                   subtitle: "text-sm text-slate-600 mb-10 leading-relaxed max-w-xs mx-auto font-serif",
                   cardContainer: "space-y-8",
                   card: "border border-[#D7CCC8] rounded-2xl p-8 bg-white shadow-lg max-w-xs mx-auto w-full relative overflow-hidden",
                   bankName: "font-bold text-xl mb-3 text-[#5D4037]",
                   accountNumber: "text-2xl font-mono tracking-widest mb-2 text-slate-800 select-all",
                   accountHolder: "text-xs text-gray-500 mb-6 uppercase tracking-wider",
                   copyButton: "w-full flex items-center justify-center gap-2 text-xs font-bold border-2 border-[#8D6E63] text-[#8D6E63] px-4 py-3 rounded-full hover:bg-[#8D6E63] hover:text-white transition-colors"
                 }}
                 cardOrnament={<Heart className="absolute top-[-20px] right-[-20px] w-32 h-32 text-[#EFEBE9] opacity-40" />}
               />
            </BaseSectionWrapper>

            {/* 09: GALLERY */}
            <BaseSectionWrapper id="gallery" className="py-20 px-4 bg-[#EFEBE9]/30 border-t border-[#D7CCC8]/50">
               <BaseGallery 
                 images={invitation.gallery || []}
                 styles={{
                   title: "font-judul font-bold text-[#5D4037] mb-10 text-center text-2xl",
                   gridContainer: "grid grid-cols-2 gap-4",
                   imageFrame: "relative overflow-hidden rounded-xl shadow-md bg-stone-200",
                   imageSpan: "col-span-2 aspect-video"
                 }}
               />
            </BaseSectionWrapper>

            {/* 10: FOOTER */}
            <BaseSectionWrapper id="footer" className="text-center pt-24 pb-12 font-isi relative bg-[#5D4037] text-[#D7CCC8]">
               <p className="text-sm mb-8 px-8 opacity-80 leading-relaxed">Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.</p>
               <h2 className="font-judul text-4xl font-bold mb-12 text-white">{invitation.groomNick} & {invitation.brideNick}</h2>
               <div className="border-t border-white/20 pt-8 mt-8 w-3/4 mx-auto">
                  <div className="flex items-center justify-center gap-2 font-bold text-sm tracking-widest uppercase">
                     <span className="w-2 h-2 rounded-full bg-[#D7CCC8]"></span> Evory Platform
                  </div>
                  <p className="text-[10px] mt-4 opacity-50 font-sans tracking-wider">© 2026 Evory. All Rights Reserved.</p>
               </div>
            </BaseSectionWrapper>

         </div>
      </div>
   );
}