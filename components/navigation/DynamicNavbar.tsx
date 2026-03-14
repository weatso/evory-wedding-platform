"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function DynamicNavbar() {
  const [isGalleryView, setIsGalleryView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        setIsGalleryView(true);
      } else {
        setIsGalleryView(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center px-6 lg:px-12 ${
        isGalleryView 
          ? "h-16 bg-[#F9F8F4]/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm" // Dikecilkan menjadi h-16
          : "h-24 bg-transparent pointer-events-none" // Dikecilkan menjadi h-24
      }`}
    >
      <div className="flex items-center justify-between w-full h-full relative">
        
        {/* LOGO CONTAINER: Dikalibrasi ulang proporsinya */}
        <Link 
          href="/" 
          className={`relative block transition-all duration-700 ease-in-out pointer-events-auto ${
            isGalleryView ? "w-28 h-7 opacity-100" : "w-32 h-8 opacity-100"
          }`}
        >
          <Image 
            src="/logo/logo-gold.png" 
            alt="Evory" 
            fill 
            className={`object-contain object-left transition-opacity duration-500 absolute top-0 left-0 ${
              isGalleryView ? "opacity-0" : "opacity-100"
            }`} 
            priority
          />
          <Image 
            src="/logo/logo-blue.png" 
            alt="Evory" 
            fill 
            className={`object-contain object-left transition-opacity duration-500 absolute top-0 left-0 ${
              isGalleryView ? "opacity-100" : "opacity-0"
            }`} 
            priority
          />
        </Link>

        {/* LABEL EKSKLUSIF */}
        <div 
          className={`absolute left-1/2 -translate-x-1/2 font-serif italic text-[#07303F] text-lg transition-all duration-700 pointer-events-none ${
            isGalleryView 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          }`}
        >
          The Collection
        </div>

      </div>
    </nav>
  );
}