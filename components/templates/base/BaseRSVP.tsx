"use client";

import { useState, useTransition } from "react";
import { submitRsvp } from "@/app/invitation/actions";
import QRCode from "react-qr-code"; // <--- Menggunakan pustaka dari package.json Anda

export interface BaseRsvpProps {
  invitationId: string;
  guest?: any | null;
  wishes: any[];
  styles?: {
    containerWrapper?: string;
    formWrapper?: string;
    label?: string;
    input?: string;
    button?: string;
    wishTitle?: string;
    wishCard?: string;
    wishName?: string;
    wishText?: string;
    badge?: string;
  };
}

export default function BaseRsvp({ invitationId, guest, wishes, styles = {} }: BaseRsvpProps) {
  const [isPending, startTransition] = useTransition();
  const [rsvpForm, setRsvpForm] = useState({
    name: guest?.name || "",
    attendance: guest?.rsvpStatus || "ATTENDING",
    message: ""
  });

  const isAlreadyAttending = guest?.rsvpStatus === "ATTENDING";
  const isDeclined = guest?.rsvpStatus === "DECLINED";

  const handleRsvpSubmit = async () => {
    if (!rsvpForm.name) return alert("Mohon isi nama Anda.");
    startTransition(async () => {
       const result = await submitRsvp(
          invitationId,
          guest?.id || null, 
          rsvpForm.name,
          rsvpForm.attendance as "ATTENDING" | "DECLINED",
          rsvpForm.message
       );

       if (result.success) {
          alert("Konfirmasi berhasil dikirim.");
          window.location.reload(); 
       } else {
          alert(result.error || "Gagal mengirim data.");
       }
    });
  };

  return (
    <div className={`w-full ${styles.containerWrapper || ""}`}>
      {/* CABANG LOGIKA: 1. TIKET QR | 2. TERIMA KASIH | 3. FORM RSVP | 4. PUBLIK */}
      
      {isAlreadyAttending ? (
        <div className={styles.formWrapper || "p-6 bg-white rounded-xl shadow-sm text-center border border-gray-200"}>
           <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm font-bold mb-6">
              Kehadiran Anda Dikonfirmasi
           </div>
           <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Tiket Masuk (QR Code)</p>
           <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 w-fit mx-auto">
              {/* IMPLEMENTASI LIBRARY react-qr-code */}
              <QRCode 
                value={guest.guestCode || guest.id} 
                size={180} 
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
              <p className="font-mono text-xs font-bold tracking-widest mt-4 text-gray-800">{guest.guestCode || guest.id}</p>
           </div>
           <p className="text-xs text-gray-500 mt-6 leading-relaxed max-w-xs mx-auto">
              Tunjukkan QR Code ini kepada penerima tamu (Usher) di lokasi acara untuk akses masuk.
           </p>
        </div>
      ) : isDeclined ? (
        <div className={styles.formWrapper || "p-6 bg-white rounded-xl shadow-sm text-center border border-gray-200"}>
            <p className="text-sm font-bold text-gray-600">Terima kasih atas konfirmasi Anda.</p>
            <p className="text-xs text-gray-500 mt-2">Kami mengerti Anda berhalangan hadir. Doa restu Anda sangat berarti bagi kami.</p>
        </div>
      ) : guest ? (
        <div className={styles.formWrapper || "p-4 bg-white rounded shadow"}>
          <div className="mb-4">
            <label className={`block mb-1 ${styles.label || "text-sm font-bold"}`}>Nama Lengkap</label>
            <input type="text" className={`w-full p-3 rounded focus:outline-none ${styles.input || "bg-gray-100 border"}`} value={guest.name} readOnly disabled />
          </div>
          <div className="mb-4">
            <label className={`block mb-1 ${styles.label || "text-sm font-bold"}`}>Kehadiran</label>
            <select className={`w-full p-3 rounded focus:outline-none ${styles.input || "bg-gray-100 border"}`} value={rsvpForm.attendance} onChange={(e) => setRsvpForm({ ...rsvpForm, attendance: e.target.value })}>
               <option value="ATTENDING">Hadir</option>
               <option value="DECLINED">Berhalangan</option>
            </select>
          </div>
          <div className="mb-4">
            <label className={`block mb-1 ${styles.label || "text-sm font-bold"}`}>Ucapan & Doa</label>
            <textarea className={`w-full p-3 h-24 rounded focus:outline-none ${styles.input || "bg-gray-100 border"}`} placeholder="Tulis ucapan selamat..." value={rsvpForm.message} onChange={(e) => setRsvpForm({ ...rsvpForm, message: e.target.value })} />
          </div>
          <button onClick={handleRsvpSubmit} disabled={isPending} className={`w-full py-3 rounded font-bold transition disabled:opacity-50 ${styles.button || "bg-black text-white"}`}>
             {isPending ? "Mengirim..." : "Kirim Konfirmasi"}
          </button>
        </div>
      ) : (
        <div className={styles.formWrapper || "p-4 bg-white rounded shadow text-center"}>
           <p className="text-sm italic opacity-70">Fitur konfirmasi kehadiran hanya tersedia melalui tautan undangan personal.</p>
        </div>
      )}

      {/* DAFTAR UCAPAN */}
      <div className="mt-12 space-y-4 text-left max-h-96 overflow-y-auto pr-2 custom-scrollbar">
         <h4 className={`text-center mb-4 uppercase ${styles.wishTitle || "font-bold text-sm"}`}>Ucapan & Doa</h4>
         {wishes && wishes.length > 0 ? (
            wishes.map((wish: any) => (
               <div key={wish.id} className={styles.wishCard || "p-4 bg-white rounded shadow"}>
                  <p className={`flex items-center gap-2 ${styles.wishName || "font-bold text-sm"}`}>
                     {wish.senderName || wish.guest?.name}
                     {wish.guest?.category && <span className={styles.badge || "bg-gray-200 px-2 py-0.5 rounded-full text-[10px]"}>{wish.guest.category}</span>}
                  </p>
                  <p className={styles.wishText || "text-xs mt-1"}>"{wish.message}"</p>
               </div>
            ))
         ) : (
            <p className="text-center text-xs opacity-50 italic">Belum ada ucapan.</p>
         )}
      </div>
    </div>
  );
}