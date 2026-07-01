"use client";

import { useState } from "react";
import { PaymentStatus } from "@prisma/client";
import { updatePaymentStatus } from "../actions";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PaymentStatusDropdown({ 
  projectId, 
  currentStatus 
}: { 
  projectId: string, 
  currentStatus: PaymentStatus 
}) {
  const [status, setStatus] = useState<PaymentStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: PaymentStatus) => {
    if (newStatus === status) return;
    
    setIsLoading(true);
    const oldStatus = status;
    setStatus(newStatus); // Optimistic update

    const res = await updatePaymentStatus(projectId, newStatus);
    
    if (res?.error) {
      toast.error(res.error);
      setStatus(oldStatus); // Revert
    } else {
      toast.success("Status pembayaran berhasil diperbarui");
    }
    setIsLoading(false);
  };

  const getStatusBadge = (s: PaymentStatus) => {
    switch (s) {
      case "PAID":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 uppercase text-[9px] tracking-widest px-2 py-1"><CheckCircle2 className="w-3 h-3 mr-1" /> Lunas</Badge>;
      case "CANCELLED":
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 uppercase text-[9px] tracking-widest px-2 py-1"><XCircle className="w-3 h-3 mr-1" /> Dibatalkan</Badge>;
      case "UNPAID":
        return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 uppercase text-[9px] tracking-widest px-2 py-1"><XCircle className="w-3 h-3 mr-1" /> Belum Lunas</Badge>;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={isLoading}
          className="h-8 w-auto px-1 hover:bg-slate-50 opacity-90 hover:opacity-100"
        >
          {getStatusBadge(status)}
          <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white border-slate-200 shadow-md">
        <DropdownMenuItem 
            onClick={() => handleStatusChange("PAID")}
            className="text-emerald-700 font-bold text-xs cursor-pointer focus:bg-emerald-50"
        >
          <CheckCircle2 className="w-3 h-3 mr-2" /> Tandai Lunas
        </DropdownMenuItem>
        <DropdownMenuItem 
            onClick={() => handleStatusChange("CANCELLED")}
            className="text-slate-700 font-bold text-xs cursor-pointer focus:bg-slate-100"
        >
          <XCircle className="w-3 h-3 mr-2" /> Dibatalkan
        </DropdownMenuItem>
        <DropdownMenuItem 
            onClick={() => handleStatusChange("UNPAID")}
            className="text-red-700 font-bold text-xs cursor-pointer focus:bg-red-50"
        >
          <XCircle className="w-3 h-3 mr-2" /> Belum Lunas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
