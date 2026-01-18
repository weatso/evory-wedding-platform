import { WeddingTemplateProps } from "@/types/template";
import { motion } from "framer-motion";

export default function Min01({ invitation, guest, config }: WeddingTemplateProps) {
  // Ambil daftar section yang aktif dari config database
  const activeSections = config.customAssets?.activeSections?.split(",") || ["hero", "couple"];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: config.fontFamily }}>
      
      {/* SECTION: HERO */}
      {activeSections.includes("hero") && (
        <section className="h-screen flex flex-col items-center justify-center text-center p-6">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="uppercase tracking-[0.3em] text-sm mb-4">
            The Wedding of
          </motion.span>
          <h1 className="text-6xl font-serif text-evory-gold">
            {invitation.groomNick} & {invitation.brideNick}
          </h1>
        </section>
      )}

      {/* SECTION: COUPLE */}
      {activeSections.includes("couple") && (
        <section className="py-20 bg-evory-base/30 text-center">
          <h2 className="text-3xl font-serif mb-10">Mempelai</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
             <div>{invitation.groomName}</div>
             <div>{invitation.brideName}</div>
          </div>
        </section>
      )}

      {/* GUEST FLOATING CARD (Hanya muncul jika ada data tamu) */}
      {guest && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur shadow-2xl px-8 py-3 rounded-full border border-evory-gold/20">
          <p className="text-xs uppercase tracking-widest text-evory-dark">
            Special Guest: <span className="font-bold">{guest.name}</span>
          </p>
        </div>
      )}
    </div>
  );
}