"use client";

import { useState } from "react";
import { assignWorkspaceToUser } from "../users/actions";
import { toast } from "sonner";
import { Building2, Mail, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AssignAgencyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await assignWorkspaceToUser(formData);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.message);
      setIsOpen(false);
    }
    setLoading(false);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] font-bold shadow-lg h-10 px-4"
      >
        <Plus className="w-4 h-4 mr-2" /> Assign Agensi ke Klien
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="w-10 h-10 bg-[#07303F] rounded-lg flex items-center justify-center text-[#E5C185]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#07303F]">Buka Akses Agensi (WO)</h2>
                <p className="text-xs text-slate-500">Angkat klien biasa menjadi Partner Ekosistem.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#07303F] uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Akun Tujuan
                </label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="email.klien@gmail.com"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#E5C185]/50 outline-none transition-all text-sm" 
                />
                <p className="text-[10px] text-slate-400">Pastikan email ini sudah pernah login ke Evory.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#07303F] uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Nama Bisnis / WO
                </label>
                <input 
                  type="text" 
                  name="agencyName" 
                  required 
                  placeholder="Misal: Radeva Wedding Organizer"
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#E5C185]/50 outline-none transition-all text-sm" 
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 h-11"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 h-11 bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] font-bold"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Eksekusi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}