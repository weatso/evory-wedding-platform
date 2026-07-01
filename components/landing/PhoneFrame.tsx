// components/landing/PhoneFrame.tsx
"use client";

import React from "react";

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[200px] h-[410px] md:w-[220px] md:h-[450px] lg:w-[250px] lg:h-[520px] bg-black rounded-[35px] shadow-[0_0_2px_2px_rgba(255,255,255,0.1),0_20px_40px_-10px_rgba(0,0,0,0.8)] border-[4px] md:border-[6px] border-[#18181b] ring-[1px] ring-[#3f3f46] overflow-hidden">
      
      {/* Side Buttons (Action & Volume) */}
      <div className="absolute top-[100px] -left-[8px] w-[3px] h-[20px] bg-[#3f3f46] rounded-l-md" />
      <div className="absolute top-[140px] -left-[8px] w-[3px] h-[40px] bg-[#3f3f46] rounded-l-md" />
      <div className="absolute top-[190px] -left-[8px] w-[3px] h-[40px] bg-[#3f3f46] rounded-l-md" />
      {/* Power Button */}
      <div className="absolute top-[160px] -right-[8px] w-[3px] h-[60px] bg-[#3f3f46] rounded-r-md" />

      {/* Dynamic Island (iPhone 16 Pro Max style) */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[60px] h-[18px] bg-black rounded-full z-30 flex items-center justify-end px-2">
         {/* Camera Lens subtle reflection */}
         <div className="w-1.5 h-1.5 rounded-full bg-[#111] border border-[#222] shadow-[inset_0_0_2px_rgba(255,255,255,0.1)]" />
      </div>
      
      {/* Screen Content */}
      <div className="w-full h-full bg-black overflow-hidden rounded-[30px]">
        {children}
      </div>

      {/* Subtle Screen Glare */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 via-transparent to-transparent pointer-events-none rounded-[55px] z-40" />
    </div>
  );
}