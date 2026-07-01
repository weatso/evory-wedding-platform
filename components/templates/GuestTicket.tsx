"use client";

import { useState } from "react";
import { QrCode, X } from "lucide-react";
import QRCode from "react-qr-code";
import { Guest } from "@prisma/client";

export default function GuestTicket({ guest }: { guest: Guest }) {
  const [isOpen, setIsOpen] = useState(false);

  // Jika belum RSVP hadir, jangan tampilkan tombol E-Ticket sama sekali
  if (guest.rsvpStatus !== "ATTENDING") return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#07303F] text-white p-4 rounded-full shadow-2xl hover:bg-[#0a455a] transition-transform hover:scale-105 animate-in slide-in-from-bottom-10"
      >
        <QrCode className="w-6 h-6" />
      </button>

      {/* Ticket Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#07303F] p-6 text-center relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-[#E5C185] font-serif text-2xl mb-1">E-Ticket</h3>
              <p className="text-white/80 text-sm">Tunjukkan QR ini kepada Usher di pintu masuk</p>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-100 mb-6">
                <QRCode
                  value={guest.guestCode}
                  size={200}
                  level="H"
                  bgColor="#ffffff"
                  fgColor="#07303F"
                />
              </div>

              <div className="text-center space-y-1 w-full">
                <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Nama Tamu</p>
                <p className="text-xl font-bold text-slate-800 border-b border-dashed border-slate-200 pb-4 mb-4">
                  {guest.name}
                </p>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Kategori:</span>
                  <span className="font-bold text-slate-800">{guest.category || "Regular"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Jatah Kursi:</span>
                  <span className="font-bold text-slate-800">{guest.totalPaxAllocated} Pax</span>
                </div>
              </div>
            </div>
            
            {/* Footer Decorative */}
            <div className="h-4 bg-[#E5C185] w-full border-t border-dashed border-white/50" />
          </div>
        </div>
      )}
    </>
  );
}
