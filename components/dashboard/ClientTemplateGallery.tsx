"use client";

import { useState, useTransition } from "react";
import { updateProjectTemplate } from "@/app/(dashboard)/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, ExternalLink, Loader2, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { motion, Variants } from "framer-motion";

const TIER_RANK: Record<string, number> = { ESSENTIAL: 1, PRESTIGE: 2, ROYAL: 3, CUSTOM: 4 };

export default function ClientTemplateGallery({ projectId, currentTemplateId, clientTier, templates }: { projectId: string; currentTemplateId: string | null; clientTier: string; templates: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticTemplateId, setOptimisticTemplateId] = useState(currentTemplateId);

  const clientRank = TIER_RANK[clientTier] || 1;

  const handleSelectTemplate = (templateId: string, templateTier: string) => {
    const tplRank = TIER_RANK[templateTier] || 1;
    if (tplRank > clientRank) { toast.error(`Akses Ditolak: Butuh paket ${templateTier}.`); return; }

    setOptimisticTemplateId(templateId);
    startTransition(async () => {
      const res = await updateProjectTemplate(projectId, templateId);
      if (res.error) { toast.error(res.error); setOptimisticTemplateId(currentTemplateId); } 
      else toast.success("Desain undangan berhasil diperbarui!");
    });
  };

  const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6 mt-12 border-t border-slate-200 pt-8">
      <h2 className="text-xl font-bold flex items-center gap-2"><LayoutTemplate className="text-blue-600" /> Galeri Desain Undangan</h2>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((tpl) => {
          const isLocked = (TIER_RANK[tpl.tier] || 1) > clientRank;
          const isActive = optimisticTemplateId === tpl.id;

          return (
            <motion.div key={tpl.id} variants={itemVariants} className={`group relative border rounded-xl overflow-hidden ${isActive ? "border-blue-500 ring-2" : "border-slate-200"}`}>
              <div className="relative aspect-[3/4] bg-slate-100">
                <img src={tpl.thumbnail} alt={tpl.name} className={`w-full h-full object-cover ${isLocked && "grayscale opacity-60"}`} />
                <div className="absolute top-3 left-3"><Badge className="bg-white/90 text-slate-800">{tpl.tier}</Badge></div>
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isLocked ? "bg-slate-900/60 opacity-100" : "bg-slate-900/40 opacity-0 group-hover:opacity-100"}`}>
                  {isLocked ? <Lock className="text-white w-8 h-8" /> : <Button variant="secondary" asChild><a href={`/preview/${tpl.slug}`} target="_blank">Preview</a></Button>}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold">{tpl.name}</h3>
                <Button onClick={() => handleSelectTemplate(tpl.id, tpl.tier)} disabled={isLocked || isActive || isPending} className="w-full mt-3">
                  {isActive ? "Sedang Digunakan" : isLocked ? "Terkunci" : "Gunakan"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}