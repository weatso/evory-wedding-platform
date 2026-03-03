"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Email atau password salah.");
        setLoading(false);
      } else {
        window.location.href = "/login"; 
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#0F0F0F] text-evory-base selection:bg-evory-gold selection:text-white font-sans overflow-hidden">
      
      {/* --- BAGIAN KIRI: VISUAL & QUOTE (Desktop Only) --- */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-[#141414] border-r border-white/5">
        
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
           <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-evory-gold/10 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-evory-gold rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
             <span className="font-serif font-bold text-evory-base text-xl">E</span>
          </div>
          <span className="font-serif text-xl tracking-[0.3em] font-light text-evory-base">EVORY</span>
        </div>

        {/* Center Quote */}
        <div className="relative z-10 max-w-lg">
           <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-evory-gold/30 bg-evory-gold/5 text-evory-gold text-[10px] tracking-[0.2em] uppercase">
              <Sparkles size={12} /> The Portal
           </div>
           <h1 className="text-5xl font-serif leading-tight mb-6 text-white">
             Where Your <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">Forever Begins.</span>
           </h1>
           <p className="text-gray-400 text-lg font-light leading-relaxed">
             Masuk untuk mengelola undangan pernikahan Anda, memantau RSVP tamu, dan mengatur detail acara dengan sempurna.
           </p>
        </div>

        {/* Footer Kecil */}
        <div className="relative z-10 text-xs text-gray-600 tracking-widest uppercase">
          © Evory Wedding Platform
        </div>
      </div>

      {/* --- BAGIAN KANAN: FORM LOGIN --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative">
        
        {/* Tombol Balik */}
        <Link href="/" className="absolute top-8 right-8 flex items-center gap-2 text-sm text-gray-500 hover:text-evory-gold transition-colors group">
          <span className="hidden sm:inline">Back to Home</span>
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-evory-gold group-hover:bg-evory-gold group-hover:text-black transition-all">
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          </div>
        </Link>

        <div className="w-full max-w-md space-y-8">
           <div className="text-center lg:text-left">
              <h2 className="text-3xl font-serif text-white mb-2">Welcome Back</h2>
              <p className="text-gray-400 text-sm">Silakan masukkan detail akun Anda untuk melanjutkan.</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error Alert */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
                >
                  <AlertCircle size={16} /> {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-widest text-gray-500 font-bold">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="nama@email.com" 
                    required 
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-evory-gold/50 focus:ring-evory-gold/20 h-12 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-xs uppercase tracking-widest text-gray-500 font-bold">Password</Label>
                    <Link href="#" className="text-xs text-evory-gold hover:underline underline-offset-4">Forgot?</Link>
                  </div>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-evory-gold/50 focus:ring-evory-gold/20 h-12 transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-evory-gold text-black hover:bg-white hover:text-black font-bold h-12 tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "SIGN IN TO PORTAL"}
              </Button>
           </form>

           <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0F0F0F] px-4 text-gray-600 tracking-widest">Or continue with</span></div>
           </div>

           <div className="grid grid-cols-1 gap-4">
              <Button 
                type="button" // WAJIB ADA agar tidak memicu submit form email/password
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                variant="outline" 
                className="border-white/10 bg-white/5 text-gray-300 hover:bg-white hover:text-black h-12 border-dashed hover:border-solid transition-all flex items-center justify-center gap-2"
              >
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                 </svg>
                 Sign in with Google
              </Button>
           </div>
        </div>
      </div>

    </div>
  );
}