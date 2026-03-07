"use client";

import { useEffect, useState } from "react";

export interface BaseEventProps {
  invitation: any; // Menerima data utuh untuk ambil tanggal & lokasi
  // Injeksi Kelas Tailwind untuk kustomisasi visual (Lego Casing)
  styles?: {
    wrapper?: string;
    title?: string;
    countdownBox?: string;
    countdownItem?: string;
    countdownNumber?: string;
    countdownLabel?: string;
    eventCard?: string;
    eventTitle?: string;
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    buttonGroup?: string;
    buttonMap?: string;
    buttonCalendar?: string;
  };
  // Slot untuk menyuntikkan ornamen SVG/Gambar statis dari template
  ornaments?: React.ReactNode; 
}

export default function BaseEvent({ invitation, styles = {}, ornaments }: BaseEventProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!invitation.eventDate) return;
    const target = new Date(invitation.eventDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [invitation.eventDate]);

  const generateGoogleCalendar = () => {
    if (!invitation.eventDate) return "#";
    const date = new Date(invitation.eventDate);
    const start = date.toISOString().replace(/-|:|\.\d+/g, "");
    const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);
    const end = endDate.toISOString().replace(/-|:|\.\d+/g, "");
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=The+Wedding+of+${invitation.groomNick}+%26+${invitation.brideNick}&dates=${start}/${end}&details=Tanpa+mengurangi+rasa+hormat,+kami+mengundang+Bapak/Ibu+untuk+hadir.&location=${invitation.location}&sf=true&output=xml`;
  };

  return (
    <div className={`relative ${styles.wrapper || "w-full space-y-8"}`}>
      {/* Ornamen yang disuntikkan dari luar (jika ada) */}
      {ornaments && <div className="absolute inset-0 pointer-events-none">{ornaments}</div>}

      <div className="relative z-10 space-y-8">
        {styles.title && <h3 className={styles.title}>Rangkaian Acara</h3>}

        {/* MESIN COUNTDOWN */}
        <div className={styles.countdownBox || "bg-white p-4 shadow-sm"}>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className={styles.countdownItem}>
              <span className={styles.countdownNumber || "text-xl font-bold block"}>{timeLeft.days}</span>
              <span className={styles.countdownLabel || "text-[10px] uppercase"}>Hari</span>
            </div>
            <div className={styles.countdownItem}>
              <span className={styles.countdownNumber || "text-xl font-bold block"}>{timeLeft.hours}</span>
              <span className={styles.countdownLabel || "text-[10px] uppercase"}>Jam</span>
            </div>
            <div className={styles.countdownItem}>
              <span className={styles.countdownNumber || "text-xl font-bold block"}>{timeLeft.minutes}</span>
              <span className={styles.countdownLabel || "text-[10px] uppercase"}>Menit</span>
            </div>
            <div className={styles.countdownItem}>
              <span className={styles.countdownNumber || "text-xl font-bold block"}>{timeLeft.seconds}</span>
              <span className={styles.countdownLabel || "text-[10px] uppercase"}>Detik</span>
            </div>
          </div>
        </div>

        {/* INFO ACARA */}
        <div className={styles.eventCard || "bg-white p-6 shadow-sm space-y-2"}>
          <h4 className={styles.eventTitle || "text-lg font-bold"}>Acara Pernikahan</h4>
          <p className={styles.eventDate || "text-sm"}>
            {invitation.eventDate ? new Date(invitation.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
          </p>
          <p className={styles.eventTime || "text-sm font-bold"}>{invitation.eventTime || "-"}</p>
          <p className={styles.eventLocation || "text-xs mt-2"}>{invitation.location || "Lokasi belum ditentukan"}</p>
        </div>

        {/* TOMBOL NAVIGASI */}
        <div className={styles.buttonGroup || "flex flex-col gap-3 items-center"}>
          <a href={invitation.mapUrl || "#"} target="_blank" rel="noreferrer" className={styles.buttonMap || "bg-black text-white px-6 py-3 rounded text-sm w-full text-center"}>
            Lihat Lokasi Peta
          </a>
          <a href={generateGoogleCalendar()} target="_blank" rel="noreferrer" className={styles.buttonCalendar || "bg-gray-200 text-black px-6 py-3 rounded text-sm w-full text-center"}>
            Simpan Tanggal
          </a>
        </div>
      </div>
    </div>
  );
}