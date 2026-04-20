"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function ExportGuestsButton({ guests, slug }: { guests: any[], slug: string }) {
    const handleExport = () => {
        if (guests.length === 0) {
            toast.error("Belum ada data tamu untuk diekspor.");
            return;
        }

        const baseUrl = window.location.origin;

        // 1. Siapkan Header CSV (Format Standar WA Blast)
        let csvContent = "Nama Lengkap,Kategori,WhatsApp,Pax,Status RSVP,Link Undangan Unik\n";

        // 2. Looping Data Tamu dan Gabungkan
        guests.forEach(g => {
            // Gunakan ?to= sesuai arsitektur server kita
            const link = `${baseUrl}/invitation/${slug}?to=${g.guestCode}`; 
            
            // Format pembersihan agar tidak merusak kolom Excel jika ada koma di nama
            const cleanPhone = g.whatsapp ? g.whatsapp.replace(/"/g, '""') : "";
            const cleanName = g.name.replace(/"/g, '""');
            
            csvContent += `"${cleanName}","${g.category || ''}","${cleanPhone}","${g.totalPaxAllocated}","${g.rsvpStatus}","${link}"\n`;
        });

        // 3. Bangun Mesin Pengunduh (Blob)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const linkTag = document.createElement("a");
        
        linkTag.setAttribute("href", url);
        linkTag.setAttribute("download", `Data_Tamu_WA_Blast_${slug}.csv`);
        
        document.body.appendChild(linkTag);
        linkTag.click();
        document.body.removeChild(linkTag);
        
        toast.success("File CSV berhasil diunduh! Siap untuk WA Blast.");
    };

    return (
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2 border-green-600 text-green-700 hover:bg-green-50">
            <Download className="w-4 h-4" /> Export WA Blast (CSV)
        </Button>
    );
}