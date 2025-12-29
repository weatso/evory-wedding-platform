'use client';

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { checkInGuest, getGuestByCode } from "./actions"; // Kita buat actions ini nanti
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Search, Eye, EyeOff, Users, Save } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";

export default function UsherScanner() {
    // STATE SCANNER
    const [isScanning, setIsScanning] = useState(true);
    
    // STATE MANUAL INPUT
    const [manualCode, setManualCode] = useState("");
    const [showCode, setShowCode] = useState(false); // Untuk toggle bintang-bintang

    // STATE DATA TAMU YANG SEDANGD DIPROSES
    const [activeGuest, setActiveGuest] = useState<any>(null);
    const [inputActualPax, setInputActualPax] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

    // 1. SETUP SCANNER
    useEffect(() => {
        if (!isScanning) return;

        const scanner = new Html5QrcodeScanner(
            "reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false
        );

        scanner.render(onScanSuccess, (err) => {});

        function onScanSuccess(decodedText: string) {
            scanner.clear();
            setIsScanning(false);
            handleLookupGuest(decodedText);
        }

        return () => {
             scanner.clear().catch(console.error);
        };
    }, [isScanning]);

    // 2. FUNGSI CARI TAMU (BY QR / MANUAL)
    // ...
    async function handleLookupGuest(code: string) {
        setProcessing(true);
        setMessage(null);
        
        const result = await getGuestByCode(code); 
        
        // --- PERBAIKAN LOGIC CHECK DISINI ---
        if (result.error || !result.guest) { // Pastikan cek !result.guest juga
            setMessage({ type: 'error', text: result.error || "Tamu tidak ditemukan" });
            setProcessing(false);
            if (!manualCode) setIsScanning(true); 
        } else {
            const guest = result.guest;
            setActiveGuest(guest);
            
            // Ambil actualPax dengan aman (gunakan 'as any' jika VS Code masih error tipe)
            const currentPax = (guest as any).actualPax || 0;
            setInputActualPax(currentPax > 0 ? currentPax : 1);
            
            setProcessing(false);
            setIsScanning(false);
        }
    }
// ...

    // 3. FUNGSI SAVE CHECK-IN
    async function handleConfirmCheckIn() {
        if (!activeGuest) return;
        setProcessing(true);

        const result = await checkInGuest(activeGuest.id, inputActualPax);
        
        setProcessing(false);
        if (result.success) {
            setMessage({ type: 'success', text: `Berhasil! ${activeGuest.name} (${inputActualPax} pax)` });
            resetFlow();
        } else {
            setMessage({ type: 'error', text: result.error || "Gagal menyimpan." });
        }
    }

    function resetFlow() {
        setActiveGuest(null);
        setManualCode("");
        setIsScanning(true); // Nyalakan scanner lagi untuk tamu berikutnya
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center">
            
            {/* HEADER */}
            <div className="w-full max-w-md flex items-center justify-between mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" className="text-slate-300 hover:text-white">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Keluar
                    </Button>
                </Link>
                <div className="text-right">
                    <h1 className="font-bold text-lg text-amber-500">USHER MODE</h1>
                    <p className="text-xs text-slate-400">Scanner & Check-in</p>
                </div>
            </div>

            {/* MESSAGE ALERT */}
            {message && (
                <div className={`w-full max-w-md p-4 mb-4 rounded-lg text-center font-bold ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {message.text}
                </div>
            )}

            {/* AREA UTAMA */}
            {!activeGuest ? (
                // --------------------------------
                // MODE 1: SCANNING & CARI MANUAL
                // --------------------------------
                <div className="w-full max-w-md space-y-6">
                    
                    {/* VIEW CAMERA */}
                    {isScanning ? (
                         <div className="overflow-hidden rounded-xl border-2 border-slate-600 bg-black shadow-2xl relative">
                            <div id="reader" className="w-full h-auto"></div>
                            <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs">Camera Active</div>
                        </div>
                    ) : (
                        <div className="bg-slate-800 p-8 rounded-xl text-center border border-slate-700">
                            <p className="text-slate-400 mb-4">Scanner Pause</p>
                            <Button onClick={() => setIsScanning(true)} variant="outline">Nyalakan Kamera</Button>
                        </div>
                    )}

                    {/* INPUT MANUAL (MASKED) */}
                    <Card className="bg-slate-800 border-slate-700">
                        <CardContent className="p-4 space-y-4">
                            <Label className="text-slate-300">Input Kode Tamu Manual</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input 
                                        type={showCode ? "text" : "password"} 
                                        placeholder="Ketik Kode Unik..." 
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                        className="bg-slate-900 border-slate-600 text-white pr-10 tracking-widest font-mono"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowCode(!showCode)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                                    >
                                        {showCode ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                    </button>
                                </div>
                                <Button 
                                    onClick={() => handleLookupGuest(manualCode)}
                                    disabled={!manualCode || processing}
                                    className="bg-amber-600 hover:bg-amber-700"
                                >
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500">*Gunakan ini jika QR Code tidak terbaca / HP tamu mati.</p>
                        </CardContent>
                    </Card>
                </div>

            ) : (
                // --------------------------------
                // MODE 2: KONFIRMASI (MODAL)
                // --------------------------------
                <Card className="w-full max-w-md bg-slate-800 border-slate-600 shadow-2xl animate-in zoom-in duration-300">
                    <CardHeader className="bg-slate-700/50 border-b border-slate-700 pb-4">
                        <CardTitle className="text-white flex items-center gap-2">
                            <CheckCircle className="text-green-500" /> Tamu Ditemukan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        
                        {/* DETAIL TAMU */}
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-amber-400">{activeGuest.name}</h2>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">{activeGuest.category}</span>
                                <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">Jatah Kursi: {activeGuest.maxPax}</span>
                            </div>
                            {activeGuest.checkInTime && (
                                <p className="text-xs text-red-400 pt-2 italic">
                                    ⚠️ Pernah Check-in jam {new Date(activeGuest.checkInTime).toLocaleTimeString()}
                                </p>
                            )}
                        </div>

                        {/* INPUT JUMLAH HADIR */}
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 space-y-3">
                            <Label className="text-slate-300 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Jumlah Hadir Sekarang?
                            </Label>
                            <div className="flex items-center gap-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setInputActualPax(Math.max(1, inputActualPax - 1))}
                                    className="w-12 h-12 text-xl font-bold"
                                >-</Button>
                                <div className="flex-1 text-center">
                                    <span className="text-4xl font-bold text-white">{inputActualPax}</span>
                                    <span className="text-sm text-slate-500 block">Orang</span>
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setInputActualPax(inputActualPax + 1)}
                                    className="w-12 h-12 text-xl font-bold"
                                >+</Button>
                            </div>
                        </div>

                        {/* TOMBOL AKSI */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Button variant="ghost" onClick={() => setActiveGuest(null)} className="text-slate-400">
                                Batal
                            </Button>
                            <Button 
                                onClick={handleConfirmCheckIn} 
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold"
                            >
                                {processing ? "Menyimpan..." : (
                                    <><Save className="w-4 h-4 mr-2" /> {activeGuest.checkInTime ? "Update Data" : "Check In"}</>
                                )}
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            )}
        </div>
    );
}