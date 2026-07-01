"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, RotateCcw } from "lucide-react";
import { payForProject, cancelProject } from "../../actions";

export function PayProjectButton({ projectId, amount }: { projectId: string, amount: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePay = () => {
    if (confirm(`Anda akan membayar proyek ini menggunakan Saldo Dompet sebesar Rp ${amount.toLocaleString("id-ID")}. Lanjutkan?`)) {
      startTransition(async () => {
        const res = await payForProject(projectId);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Pembayaran berhasil! Proyek sekarang AKTIF.");
          router.refresh();
        }
      });
    }
  };

  return (
    <Button 
      onClick={handlePay}
      disabled={isPending || amount <= 0}
      size="sm"
      className="bg-[#07303F] text-[#E5C185] hover:bg-[#0a465c] font-bold text-[10px] h-7 px-3"
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
      ) : (
        <Wallet className="w-3 h-3 mr-1.5" />
      )}
      Bayar
    </Button>
  );
}

export function RefundProjectButton({ projectId, amount }: { projectId: string, amount: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRefund = () => {
    if (confirm(`Batalkan proyek ini? Saldo sebesar Rp ${amount.toLocaleString("id-ID")} akan dikembalikan ke dompet agensi Anda.`)) {
      startTransition(async () => {
        const res = await cancelProject(projectId);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Proyek dibatalkan. Saldo berhasil di-refund.");
          router.refresh();
        }
      });
    }
  };

  return (
    <Button 
      onClick={handleRefund}
      disabled={isPending}
      size="sm"
      variant="outline"
      className="border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 font-bold text-[10px] h-7 px-3"
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
      ) : (
        <RotateCcw className="w-3 h-3 mr-1.5" />
      )}
      Batal & Refund
    </Button>
  );
}
