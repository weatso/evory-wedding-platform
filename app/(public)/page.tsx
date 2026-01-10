import Envelope3D from "@/components/landing/Envelope3D";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="container mx-auto px-6 py-10 min-h-[85vh] flex flex-col md:flex-row items-center justify-center">
        
        {/* KIRI: 3D ANIMATION */}
        <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1 relative mt-10 md:mt-0">
            {/* Background Blur Emas */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-evory-gold/20 blur-[80px] rounded-full -z-10" />
            <Envelope3D />
        </div>

        {/* KANAN: TEXT CONTENT */}
        <div className="w-full md:w-1/2 space-y-8 order-1 md:order-2 text-center md:text-left z-10">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-evory-dark leading-[1.1]">
                The Future of <br/>
                <span className="text-gold-gradient italic pr-2">Digital RSVP.</span>
            </h1>
            <p className="text-lg text-evory-grey max-w-lg mx-auto md:mx-0 leading-relaxed font-light">
                Platform undangan pernikahan premium dengan fitur Real-time Check-in, Manajemen Tamu Cerdas, dan Desain Eksklusif untuk momen terbaik Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <Link href="/login">
                    <Button className="w-full sm:w-auto bg-evory-gold hover:bg-amber-600 text-white rounded-full px-8 py-6 text-lg shadow-xl shadow-evory-gold/30 transition-transform hover:scale-105">
                        Mulai Sekarang
                    </Button>
                </Link>
                <Link href="/invitation/romeo-juliet">
                    <Button variant="outline" className="w-full sm:w-auto border-evory-dark text-evory-dark rounded-full px-8 py-6 text-lg hover:bg-evory-dark hover:text-white group">
                        Lihat Demo <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                    </Button>
                </Link>
            </div>
            
            {/* Stats Kecil */}
            <div className="pt-8 flex items-center justify-center md:justify-start gap-8 text-evory-grey text-sm font-medium">
                <div>
                    <span className="block text-2xl font-bold text-evory-dark">10k+</span>
                    <span className="text-xs uppercase tracking-wider">Tamu Terdaftar</span>
                </div>
                <div className="h-8 w-[1px] bg-gray-300"></div>
                <div>
                    <span className="block text-2xl font-bold text-evory-dark">100%</span>
                    <span className="text-xs uppercase tracking-wider">Uptime</span>
                </div>
            </div>
        </div>
    </div>
  )
}