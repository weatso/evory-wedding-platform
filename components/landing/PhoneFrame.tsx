// components/landing/PhoneFrame.tsx
"use client";

import React from "react";

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[280px] h-[580px] sm:w-[320px] sm:h-[650px] lg:w-[360px] lg:h-[720px] bg-black rounded-[50px] shadow-[0_0_2px_2px_rgba(255,255,255,0.1),0_20px_40px_-10px_rgba(0,0,0,0.8)] border-[6px] border-[#333] ring-[2px] ring-[#111] overflow-hidden">
      {/* Dynamic Island / Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-20" />
      
      {/* Screen Content */}
      <div className="w-full h-full bg-white overflow-hidden rounded-[42px]">
        {children}
      </div>

      {/* Glossy Reflection (Optional) */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/5 to-transparent pointer-events-none rounded-[50px] z-30" />
    </div>
  );
}