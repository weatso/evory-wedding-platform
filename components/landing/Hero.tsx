"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  const evoryLetters = "EVORY".split("");

  return (
    <section className="relative h-screen w-full flex items-center justify-center bg-[#07303F]">
      <motion.div
        className="absolute top-0 left-0 right-0 h-[110vh] z-0 origin-center bg-[#07303F]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {/* Overlay Tiber gelap agar teks/logo Emas lebih menyala */}
        <div className="absolute inset-0 bg-[#07303F]/80 z-10 mix-blend-multiply"></div>
        
        {/* Menggunakan Unsplash statis sebagai fallback karena video hero-bg.mp4 belum ada di repo ini */}
        <img
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop"
          alt="Sanctuary Background"
          className="object-cover w-full h-full relative z-0 opacity-40 grayscale"
        />
      </motion.div>

      <div className="relative z-20 text-center flex flex-col items-center -translate-y-8 md:-translate-y-12">
        {/* LOGO GOLD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mb-6 relative w-20 h-20 md:w-28 md:h-28"
        >
          <Image
            src="/logo/logo-gold.png"
            alt="Evory Gold Logo"
            fill
            className="object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* NAMA BRAND */}
        <div className="overflow-hidden flex gap-1 md:gap-2">
          {evoryLetters.map((letter, i) => (
            <motion.h1
              key={i}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: i * 0.1 + 0.3 }}
              className="font-sans font-medium text-5xl md:text-8xl lg:text-9xl tracking-widest uppercase text-white"
            >
              {letter}
            </motion.h1>
          ))}
        </div>

        {/* TAGLINE GOLD PIZZAZZ */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="font-sans mt-6 text-[10px] sm:text-xs md:text-sm tracking-[0.4em] uppercase text-[#E5C185] px-4 font-medium"
        >
          Illuminating Your Best Moments
        </motion.p>
      </div>

      {/* INDIKATOR SCROLL KE BAWAH */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center opacity-70 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={() => document.getElementById("highlight-section")?.scrollIntoView({ behavior: "smooth" })}
      >
        <p className="text-[9px] uppercase tracking-[0.3em] text-[#E5C185] mb-3 font-bold">Discover</p>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="w-5 h-5 text-[#E5C185]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
