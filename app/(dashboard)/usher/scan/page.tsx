'use client';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import { Html5QrcodeScanner } from "html5-qrcode";
import { processQrScan, getEventDetail } from "./actions"; 
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function UsherScannerPage() {
    return (
        <Suspense fallback={<div className="text-white p-10">Memuat...</div>}>
            <ScannerContent />
        </Suspense>
    );
}

function ScannerContent() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get("id");

    const [isScanning, setIsScanning] = useState(true);
    const [eventName, setEventName] = useState("Memuat...");
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

    // Perbaikan: Penambahan tipe eksplisit (d: any) agar TypeScript tidak mengeluh
    useEffect(() => {
        if (!eventId) return;
        getEventDetail(eventId).then((d: any) => d && setEventName(`${d.groomNick} & ${d.brideNick}`));
    }, [eventId]);

    useEffect(() => {
        if (!isScanning || !eventId) return;
        
        const scanner = new Html5QrcodeScanner("reader", { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0 
        }, false);
        
        let isScannerCleared = false;

        scanner.render(
            (decodedText) => {
                if (isScannerCleared) return;
                isScannerCleared = true; 
                
                scanner.clear().then(() => {
                    setIsScanning(false);
                    handleScan(decodedText);
                }).catch((e) => {
                    console.error("Gagal matikan hardware:", e);
                    setIsScanning(false);
                    handleScan(decodedText);
                });
            }, 
            (error) => {} 
        );

        return () => { 
            if (!isScannerCleared) {
                isScannerCleared = true;
                scanner.clear().catch(() => {}); 
            }
        };
    }, [isScanning, eventId]);

    async function handleScan(code: string) {
        if (!eventId) return;
        setProcessing(true); 
        setMessage(null);
        
        const res = await processQrScan(eventId, code);
        
        setProcessing(false);

        if (!res.success) {
            setMessage({ type: 'error', text: res.error || "Gagal memproses QR." });
            setTimeout(() => setIsScanning(true), 2500); 
        } else {
            setMessage({ type: 'success', text: `Check-In Berhasil: ${res.guestName} (${res.pax} Pax)` });
            setTimeout(() => setIsScanning(true), 2500); 
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 font-sans flex flex-col items-center">
            <div className="w-full max-w-md flex justify-between items-center mb-6">
                <Link href="/usher"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4"/> Keluar</Button></Link>
                <div className="text-amber-500 font-bold">{eventName}</div>
            </div>

            {message && (
                <div className={`w-full max-w-md p-4 mb-4 rounded-lg font-bold text-center animate-in fade-in slide-in-from-top-4 ${message.type==='error'?'bg-red-600':'bg-green-600'}`}>
                    {message.type === 'success' ? <CheckCircle className="inline w-5 h-5 mr-2" /> : <AlertTriangle className="inline w-5 h-5 mr-2" />}
                    {message.text}
                </div>
            )}
            
            <div className={`w-full max-w-md bg-slate-800 p-6 rounded-xl border border-slate-700 text-center`}>
                <div id="reader" className={`overflow-hidden rounded-lg w-full ${!isScanning ? 'hidden' : 'block'}`}></div>

                {processing && (
                    <div className="py-10 text-amber-500 animate-pulse font-bold text-lg">Memproses Data...</div>
                )}

                {!isScanning && !processing && (
                    <Button onClick={() => setIsScanning(true)} className="mt-4 w-full bg-amber-600 hover:bg-amber-700">
                        Lanjut Scan Berikutnya
                    </Button>
                )}
                
                <p className="mt-4 text-slate-400 text-sm">Arahkan kamera ke QR Code Tamu</p>
            </div>
        </div>
    );
}