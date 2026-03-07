"use client";

import { Copy } from "lucide-react";

type DigitalEnvelope = { bankName: string; accountNumber: string; accountHolder: string; qrisUrl?: string; };

export interface BaseGiftProps {
  envelopes: DigitalEnvelope[];
  guest?: any | null; // Cek apakah tamu VIP
  styles?: {
    wrapper?: string;
    title?: string;
    subtitle?: string;
    cardContainer?: string;
    card?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    qrisImage?: string;
    copyButton?: string;
  };
  cardOrnament?: React.ReactNode;
}

export default function BaseGift({ envelopes, guest, styles = {}, cardOrnament }: BaseGiftProps) {
  // LOGIKA BISNIS: Lenyap jika tidak ada data rekening ATAU jika tamu adalah publik (guest null)
  if (!envelopes || envelopes.length === 0 || !guest) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Berhasil disalin: " + text);
  };

  return (
    <div className={`relative ${styles.wrapper || "w-full text-center space-y-6"}`}>
      {styles.title && <h3 className={styles.title}>Tanda Kasih</h3>}
      {styles.subtitle && <p className={styles.subtitle}>Doa restu Anda merupakan karunia yang sangat berarti bagi kami.</p>}
      
      <div className={styles.cardContainer || "space-y-6"}>
        {envelopes.map((env, idx) => (
          <div key={idx} className={styles.card || "p-6 bg-white rounded-xl shadow border relative overflow-hidden max-w-xs mx-auto"}>
            {cardOrnament && <div className="absolute inset-0 z-0 pointer-events-none">{cardOrnament}</div>}
            
            <div className="relative z-10">
              <div className={styles.bankName || "font-bold text-lg mb-2"}>{env.bankName}</div>
              <p className={styles.accountNumber || "text-xl font-mono mb-1 select-all"}>{env.accountNumber}</p>
              <p className={styles.accountHolder || "text-xs uppercase mb-4"}>a.n {env.accountHolder}</p>
              
              {env.qrisUrl && (
                <div className="mb-4 flex justify-center">
                  <img src={env.qrisUrl} alt="QRIS" className={styles.qrisImage || "w-40 h-40 object-contain rounded border p-2 bg-white"} />
                </div>
              )}
              
              <button 
                className={styles.copyButton || "w-full flex items-center justify-center gap-2 text-xs border px-4 py-2 rounded transition"} 
                onClick={() => handleCopy(env.accountNumber)}
              >
                <Copy className="w-3.5 h-3.5" /> Salin Rekening
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}