"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
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
        setError("Kredensial tidak valid. Akses ditolak.");
        setLoading(false);
      } else {
        window.location.href = "/dashboard"; // Arahkan ke dashboard partner/admin
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem pada server otentikasi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex selection:bg-[#E5C185] selection:text-[#07303F] font-sans">
      
      {/* BAGIAN KIRI: Visual & Branding (Hanya Muncul di Desktop) - NAVY BLUE */}
      <div className="hidden lg:flex w-1/2 bg-[#07303F] flex-col justify-between p-12 relative overflow-hidden border-r border-[#E5C185]/10">
        
        {/* Ornamen Latar Belakang */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#E5C185]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] pointer-events-none" />

        {/* Navigasi Kembali & Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#E5C185]/70 hover:text-[#E5C185] transition-colors text-xs font-bold uppercase tracking-widest mb-16 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Etalase</span>
          </Link>
          <div className="relative w-32 h-10">
            <Image src="/logo/logo-gold.png" alt="Evory" fill className="object-contain object-left" priority />
          </div>
        </div>

        {/* Copywriting Premium */}
        <div className="relative z-10 max-w-md">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#E5C185]/30 bg-[#E5C185]/5 text-[#E5C185] text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
            Partner Portal
          </div>
          <h1 className="text-4xl lg:text-5xl font-sans font-bold leading-tight text-[#F9F8F4] mb-6 tracking-tight">
            Akses menuju <br />
            <span className="font-serif italic font-normal text-[#E5C185]">The Vault.</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed font-light">
            Sistem manajemen terpusat untuk mitra Evory. Kelola mahakarya digital, pantau konfirmasi kehadiran, dan kendalikan setiap aspek hari bahagia klien Anda.
          </p>
        </div>

        {/* Footer Kiri */}
        <div className="relative z-10 flex items-center gap-2 text-[#E5C185]/50 text-[10px] uppercase tracking-widest font-bold">
          <Lock size={12} /> <span>End-to-End Encrypted System</span>
        </div>
      </div>

      {/* BAGIAN KANAN: Formulir Login - IVORY */}
      <div className="w-full lg:w-1/2 bg-[#F9F8F4] flex flex-col justify-center items-center p-6 sm:p-12 relative">
        
        {/* Navigasi Mobile */}
        <Link href="/" className="lg:hidden absolute top-6 left-6 inline-flex items-center gap-2 text-slate-400 hover:text-[#07303F] transition-colors text-[10px] font-bold uppercase tracking-widest">
          <ArrowLeft size={14} /> <span>Kembali</span>
        </Link>

        {/* Logo Mobile */}
        <div className="lg:hidden relative w-28 h-8 mb-12">
          <Image src="/logo/logo-blue.png" alt="Evory" fill className="object-contain object-center" />
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-[#07303F] mb-2">Welcome Back</h2>
            <p className="text-sm text-slate-500">Silakan masukkan detail akun Anda untuk melanjutkan.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Alert dengan Framer Motion */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}

            {/* INPUT EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</label>
              <input 
                name="email"
                type="email" 
                required
                className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-[#07303F] font-medium focus:outline-none focus:border-[#07303F] transition-colors placeholder:text-slate-300 rounded-none"
                placeholder="partner@evory.com"
              />
            </div>

            {/* INPUT PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Security Key</label>
                <Link href="#" className="text-[10px] font-bold text-[#E5C185] hover:text-[#07303F] transition-colors uppercase tracking-wider">
                  Forgot?
                </Link>
              </div>
              <input 
                name="password"
                type="password" 
                required
                className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-[#07303F] font-medium focus:outline-none focus:border-[#07303F] transition-colors placeholder:text-slate-300 rounded-none"
                placeholder="••••••••"
              />
            </div>

            {/* TOMBOL SUBMIT CREDENTIALS */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#07303F] text-[#F9F8F4] h-14 rounded-sm font-bold flex items-center justify-center gap-3 hover:bg-[#0a455a] transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-[#07303F]/20"
            >
              {loading ? (
                <Loader2 className="animate-spin text-[#E5C185]" size={20} />
              ) : (
                <>
                  <span className="uppercase tracking-widest text-xs">Authorize Access</span>
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform text-[#E5C185]" />
                </>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-[#F9F8F4] px-4 text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* TOMBOL GOOGLE SIGN-IN */}
          <button 
            type="button" 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full border-2 border-slate-200 bg-transparent text-[#07303F] hover:border-[#07303F] h-14 rounded-sm transition-all flex items-center justify-center gap-3 font-bold group"
          >
            <svg className="w-5 h-5 text-slate-600 group-hover:text-[#07303F] transition-colors" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="uppercase tracking-widest text-xs">Sign in with Google</span>
          </button>

        </div>
      </div>
      
    </div>
  );
}