'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function AutoRefresh() {
    const router = useRouter();
    const [lastUpdate, setLastUpdate] = useState(new Date());

    useEffect(() => {
        // Refresh halaman setiap 5 detik agar data live
        const interval = setInterval(() => {
            router.refresh();
            setLastUpdate(new Date());
        }, 5000); // 5000ms = 5 detik

        return () => clearInterval(interval);
    }, [router]);

    return (
        <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] text-slate-400 hover:text-slate-600 gap-1 h-auto py-1"
            onClick={() => { router.refresh(); setLastUpdate(new Date()); }}
        >
            <RefreshCw className="w-3 h-3" />
            {lastUpdate.toLocaleTimeString()}
        </Button>
    );
}