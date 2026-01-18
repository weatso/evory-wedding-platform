"use client";

import { motion } from "framer-motion";
import Envelope3D from "@/components/landing/Envelope3D";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { TEMPLATES } from "@/components/templates/registry";

export default function LandingPage() {
  // Data simulasi portofolio (gambar statis)
  const portfolioImages = [
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400",
    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=400",
    "https://images.unsplash.com/photo-1465495910483-0d6745778703?q=80&w=400",
    "https://images.unsplash.com/photo-1522673607200-1648832cee98?q=80&w=400",
  ];

  return (
    <main className="bg-evory-base min-h-screen">
      {/* SECTION 1: HERO */}
      <section className="container mx-auto px-6 py-20 min-h-[90vh] flex flex-col md:flex-row items-center justify-center relative">
        <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1 relative mt-10 md:mt-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-evory-gold/20 blur-[80px] rounded-full -z-10" />
          <Envelope3D />
        </div>

        <div className="w-full md:w-1/2 space-y-8 order-1 md:order-2 text-center md:text-left z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-evory-dark leading-[1.1]">
            The Future of <br />
            <span className="text-gold-gradient italic pr-2">Digital RSVP.</span>
          </h1>
          <p className="text-lg text-evory-grey max-w-lg mx-auto md:mx-0 leading-relaxed font-light">
            Platform undangan pernikahan premium dengan fitur Real-time Check-in, Manajemen Tamu Cerdas, dan Desain Eksklusif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <Link href="/login">
              <Button className="w-full sm:w-auto bg-evory-gold hover:bg-evory-gold-dim text-white rounded-full px-8 py-6 text-lg shadow-xl shadow-evory-gold/30">
                Mulai Sekarang
              </Button>
            </Link>
            <Link href="#templates">
              <Button variant="outline" className="w-full sm:w-auto border-evory-dark text-evory-dark rounded-full px-8 py-6 text-lg group">
                Lihat Koleksi <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: MARQUEE PORTOFOLIO */}
      <section className="py-20 border-y border-gray-200 bg-white overflow-hidden">
        <div className="flex">
          <motion.div
            className="flex space-x-8 whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            {[...portfolioImages, ...portfolioImages].map((src, index) => (
              <div key={index} className="w-[350px] h-[220px] bg-evory-base rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                <img src={src} alt="Portfolio" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: TEMPLATES (SPLIT LAYOUT) */}
      <section id="templates" className="relative">
        <div className="flex flex-col md:flex-row">
          
          {/* KIRI: PREVIEW LIST */}
          <div className="w-full md:w-3/5 p-6 md:p-20 space-y-32">
            {TEMPLATES.map((template) => (
              <motion.div 
                key={template.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="group relative"
              >
                <div className="relative mx-auto w-full max-w-[300px] aspect-[9/19] bg-evory-dark rounded-[2.5rem] border-[6px] border-evory-dark shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                    <span className="text-evory-grey font-serif italic">{template.name}</span>
                  </div>
                  <div className="absolute inset-0 bg-evory-dark/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 text-center z-10">
                    <h3 className="text-white text-xl font-serif mb-4">{template.name}</h3>
                    <Link href={`/invitation/demo-${template.id}`} target="_blank">
                      <Button className="bg-evory-gold hover:bg-white hover:text-evory-dark text-white rounded-full text-sm">
                        Live Demo <ExternalLink className="ml-2 w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* KANAN: KOTAK EMAS STICKY */}
          <div className="hidden md:block md:w-2/5">
            <div className="sticky top-0 h-screen bg-gold-gradient shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex items-center justify-center p-12">
              <div className="text-white space-y-6">
                <h2 className="text-5xl lg:text-6xl font-serif">
                  The <br /> <span className="italic italic-gold">Collection.</span>
                </h2>
                <div className="w-16 h-[1px] bg-white/50" />
                <p className="text-lg font-light opacity-90 leading-relaxed">
                  Pilih desain terbaik untuk hari spesial Anda. Setiap template memiliki karakteristik unik yang elegan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SEDERHANA */}
      <footer className="py-20 bg-evory-dark text-white text-center">
         <p className="opacity-50 font-light">&copy; 2024 Evory Digital. All Rights Reserved.</p>
      </footer>
    </main>
  );
}