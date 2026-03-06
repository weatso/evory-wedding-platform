"use client";

import { useState, useTransition } from "react";
import { updateInvitationTemplate } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, ExternalLink, Loader2, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { motion, Variants } from "framer-motion";

const TIER_RANK: Record<string, number> = {
  ESSENTIAL: 1,
  PRESTIGE: 2,
  ROYAL: 3,
  CUSTOM: 4,
};

type TemplateWithCategory = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  tier: string;
  category: { name: string };
};

interface ClientTemplateGalleryProps {
  invitationId: string;
  currentTemplateId: string | null;
  clientTier: string;
  templates: TemplateWithCategory[];
}

export default function ClientTemplateGallery({
  invitationId,
  currentTemplateId,
  clientTier,
  templates,
}: ClientTemplateGalleryProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticTemplateId, setOptimisticTemplateId] = useState(currentTemplateId);

  const clientRank = TIER_RANK[clientTier] || 1;

  const handleSelectTemplate = (templateId: string, templateTier: string) => {
    const tplRank = TIER_RANK[templateTier] || 1;
    
    if (tplRank > clientRank) {
      toast.error(`Akses Ditolak: Template ini membutuhkan paket ${templateTier}. Silakan hubungi Admin untuk upgrade.`);
      return;
    }

    setOptimisticTemplateId(templateId);
    
    startTransition(async () => {
      const res = await updateInvitationTemplate(invitationId, templateId);
      if (res.error) {
        toast.error(res.error);
        setOptimisticTemplateId(currentTemplateId); 
      } else {
        toast.success("Desain undangan berhasil diperbarui!");
      }
    });
  };

  // PERBAIKAN: Gunakan tipe Variants mutlak dari framer-motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6 mt-12 border-t border-slate-200 pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-blue-600" />
            Galeri Desain Undangan
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Pilih tema visual yang merepresentasikan acara Anda. Paket Anda saat ini: <strong className="text-slate-900">{clientTier}</strong>.
          </p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {templates.map((tpl) => {
          const tplRank = TIER_RANK[tpl.tier] || 1;
          const isLocked = tplRank > clientRank;
          const isActive = optimisticTemplateId === tpl.id;

          return (
            <motion.div 
              key={tpl.id} 
              variants={itemVariants}
              className={`group relative border rounded-xl overflow-hidden transition-all duration-300 ${
                isActive ? "border-blue-500 ring-4 ring-blue-500/20 bg-blue-50/30" : "border-slate-200 bg-white hover:shadow-xl hover:border-slate-300"
              }`}
            >
              <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                <img 
                  src={tpl.thumbnail} 
                  alt={tpl.name} 
                  className={`w-full h-full object-cover transition-transform duration-700 ${!isLocked && "group-hover:scale-105"} ${isLocked && "grayscale opacity-60"}`}
                />
                
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <Badge className={`backdrop-blur-md shadow-sm border-0 ${
                    tpl.tier === 'ROYAL' ? 'bg-amber-500/90 text-white' : 
                    tpl.tier === 'PRESTIGE' ? 'bg-slate-800/90 text-white' : 
                    'bg-white/90 text-slate-800'
                  }`}>
                    {tpl.tier}
                  </Badge>
                </div>

                <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300 ${
                  isLocked ? "bg-slate-900/60 opacity-100" : "bg-slate-900/40 opacity-0 group-hover:opacity-100"
                }`}>
                  {isLocked ? (
                    <div className="flex flex-col items-center text-white/90">
                      <Lock className="w-8 h-8 mb-2" />
                      <span className="text-xs font-bold tracking-widest uppercase">Terkunci</span>
                    </div>
                  ) : (
                    <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-slate-900 font-bold" asChild>
                      <a href={`/preview/${tpl.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Preview
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{tpl.category.name}</p>
                </div>

                <Button 
                  onClick={() => handleSelectTemplate(tpl.id, tpl.tier)}
                  disabled={isLocked || isActive || isPending}
                  variant={isActive ? "outline" : "default"}
                  className={`w-full transition-all ${
                    isActive 
                      ? "border-blue-500 text-blue-700 bg-blue-50 pointer-events-none" 
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {isPending && optimisticTemplateId === tpl.id ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                  ) : isActive ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Sedang Digunakan</>
                  ) : isLocked ? (
                    <><Lock className="w-4 h-4 mr-2" /> Upgrade Paket</>
                  ) : (
                    "Gunakan Desain"
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}