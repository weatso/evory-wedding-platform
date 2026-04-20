"use client";

import { useState } from "react";
import { submitPartnershipApplication } from "./actions";
import { Loader2, Briefcase, MapPin, Globe, User, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPartnerPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await submitPartnershipApplication(formData);
    
    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else if (result.success) {
      setSuccess(true);
      toast.success("Aplikasi Kemitraan berhasil dikirim!");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9F8F4] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-[#07303F] text-[#E5C185] rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif text-[#07303F]">Aplikasi Sedang Ditinjau</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Data agensi Anda telah masuk ke sistem kami. Tim Pusat Evory akan meninjau portofolio Anda. Anda tidak akan bisa mengakses Dashboard sebelum status aplikasi Anda disetujui.
          </p>
          <Link href="/login" className="inline-flex items-center justify-center w-full h-12 mt-6 bg-slate-100 text-[#07303F] font-bold rounded-xl hover:bg-slate-200 transition-colors">
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F4] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center mb-8">
          <h2 className="text-[10px] font-bold tracking-widest text-[#E5C185] uppercase mb-2">Evory Partnership Network</h2>
          <h1 className="text-3xl font-serif text-[#07303F]">Daftarkan Agensi Anda</h1>
        </div>

        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Informasi Akun (Manager/Owner)</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <User className="w-5 h-5 absolute top-3.5 left-3.5 text-slate-400" />
                  <input name="name" required placeholder="Nama Lengkap" className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#E5C185]/50 outline-none transition-all text-sm" />
                </div>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute top-3.5 left-3.5 text-slate-400" />
                  <input name="email" type="email" required placeholder="Email Bisnis" className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#E5C185]/50 outline-none transition-all text-sm" />
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute top-3.5 left-3.5 text-slate-400" />
                  <input name="password" type="password" required minLength={6} placeholder="Password" className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#E5C185]/50 outline-none transition-all text-sm" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Profil Agensi</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="relative">
                  <Briefcase className="w-5 h-5 absolute top-3.5 left-3.5 text-slate-400" />
                  <input name="agencyName" required placeholder="Nama Agensi / Wedding Organizer" className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#E5C185]/50 outline-none transition-all text-sm" />
                </div>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute top-3.5 left-3.5 text-slate-400" />
                  <input name="location" required placeholder="Kota Basis Operasional (Misal: Jakarta)" className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#E5C185]/50 outline-none transition-all text-sm" />
                </div>
                <div className="relative">
                  <Globe className="w-5 h-5 absolute top-3.5 left-3.5 text-slate-400" />
                  <input name="portfolioUrl" type="url" placeholder="Tautan Portofolio (Instagram / Website) - Opsional" className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#E5C185]/50 outline-none transition-all text-sm" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-12 bg-[#07303F] text-[#E5C185] font-bold rounded-xl hover:bg-[#0a465c] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#07303F]/20 disabled:opacity-70 mt-6">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Kirim Aplikasi Kemitraan <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-500">
            Sudah memiliki Workspace? <Link href="/login" className="text-[#07303F] font-bold hover:underline">Masuk ke Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}