"use client";

import { useState } from "react";
import { processApplication } from "./actions";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";

export default function ApplicationActions({ applicationId, agencyName }: { applicationId: string, agencyName: string }) {
  const [loading, setLoading] = useState<"APPROVE" | "REJECT" | null>(null);

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (action === "REJECT" && !confirm(`Anda yakin ingin menolak aplikasi dari ${agencyName}?`)) return;
    
    setLoading(action);
    const result = await processApplication(applicationId, action);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => handleAction("REJECT")}
        disabled={loading !== null}
        className="flex-1 h-10 rounded-lg border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors flex items-center justify-center disabled:opacity-50"
      >
        {loading === "REJECT" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-1"/> Tolak</>}
      </button>
      
      <button 
        onClick={() => handleAction("APPROVE")}
        disabled={loading !== null}
        className="flex-1 h-10 rounded-lg bg-[#07303F] text-[#E5C185] font-bold text-xs hover:bg-[#0a465c] transition-colors flex items-center justify-center disabled:opacity-50 shadow-md shadow-[#07303F]/10"
      >
        {loading === "APPROVE" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1"/> Setujui & Buat Agensi</>}
      </button>
    </div>
  );
}