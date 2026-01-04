'use client';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import { Html5QrcodeScanner } from "html5-qrcode";
import { checkInGuest, getGuestByCode, getEventDetail } from "./actions"; // Pastikan actions.ts sudah diupdate juga
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Search, Eye, EyeOff, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";

// Wrapper Suspense wajib ada karena kita menggunakan useSearchParams
export default function UsherScannerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Memuat Scanner...</div>}>
            <ScannerContent />
        </Suspense>
    );
}

function ScannerContent() {
    // 1. Ambil ID Acara dari URL (dikirim dari Dashboard Usher)
    const searchParams = useSearchParams();
    const eventId = searchParams.get("id");

    // State Scanner & UI
    const [isScanning, setIsScanning] = useState(true);
    const [manualCode, setManualCode] = useState("");
    const [showCode, setShowCode] = useState(false);
    
    // State Data Transaksi
    const [eventName, setEventName] = useState("Memuat Data Acara...");
    const [activeGuest, setActiveGuest] = useState<any>(null);
    const [inputActualPax, setInputActualPax] = useState(1);
    
    // State Feedback User
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

    // EFFECT 1: Ambil Detail Nama Acara (Judul Header)
    useEffect(() => {
        if (!eventId) {
            setEventName("Mode Global (Tidak Disarankan)");
            return;
        }
        
        getEventDetail(eventId).then(data => {
            if (data) {
                setEventName(`${data.groomNick} & ${data.brideNick}`);
            } else {
                setEventName("Acara Tidak Ditemukan");
            }
        });
    }, [eventId]);

    // EFFECT 2: Inisialisasi Kamera Scanner
    useEffect(() => {
        // Jangan nyalakan kamera jika sedang ada popup tamu atau tidak ada event ID
        if (!isScanning || activeGuest || !eventId) return;

        // Config Scanner
        const scanner = new Html5QrcodeScanner(
            "reader", 
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0 
            }, 
            false
        );

        scanner.render(onScanSuccess, (err) => {
            // Error scanning frame biasa terjadi (ignore console spam)
        });

        function onScanSuccess(decodedText: string) {
            scanner.clear(); // Matikan kamera setelah dapat kode
            setIsScanning(false);
            handleLookupGuest(decodedText);
        }

        // Cleanup saat unmount
        return () => {
            scanner.clear().catch(console.error);
        };
    }, [isScanning, activeGuest, eventId]);

    // FUNGSI 1: Cari Tamu (Scan / Manual)
    async function handleLookupGuest(code: string) {
        if (!eventId) return;

        setProcessing(true);
        setMessage(null);
        
        // Panggil Server Action dengan Event ID untuk validasi
        const result = await getGuestByCode(code, eventId); 
        
        if (result.error || !result.guest) {
            setMessage({ type: 'error', text: result.error || "Tamu tidak ditemukan / Salah Acara" });
            setProcessing(false);
            // Jika error karena scan, nyalakan lagi kamera (beri delay sedikit biar user baca error)
            if (!manualCode) {
                setTimeout(() => setIsScanning(true), 2000);
            }
        } else {
            // Tamu Valid & Sesuai Acara
            const guest = result.guest;
            setActiveGuest(guest);
            
            // Logic Pax: Jika sudah pernah datang, tampilkan angka terakhir. Jika belum, default 1.
            const currentPax = (guest as any).actualPax || 0;
            setInputActualPax(currentPax > 0 ? currentPax : 1);
            
            setProcessing(false);
            setIsScanning(false); // Pastikan kamera mati saat modal muncul
        }
    }

    // FUNGSI 2: Simpan Check-in
    async function handleConfirmCheckIn() {
        if (!activeGuest) return;
        setProcessing(true);

        const result = await checkInGuest(activeGuest.id, inputActualPax);
        
        setProcessing(false);
        if (result.success) {
            setMessage({ type: 'success', text: `✅ SUKSES: ${activeGuest.name} (${inputActualPax} pax)` });
            resetFlow();
        } else {
            setMessage({ type: 'error', text: result.error || "Gagal menyimpan data." });
        }
    }

    // Reset untuk tamu berikutnya
    function resetFlow() {
        setActiveGuest(null);
        setManualCode("");
        setInputActualPax(1);
        // Nyalakan scanner lagi setelah delay singkat
        setTimeout(() => setIsScanning(true), 1500);
    }

    // --- RENDER BLOCKING: JIKA TIDAK ADA EVENT ID ---
    if (!eventId) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
                <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 max-w-sm w-full">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mb-4 mx-auto" />
                    <h1 className="text-xl font-bold text-white mb-2">Acara Belum Dipilih</h1>
                    <p className="text-slate-400 mb-6 text-sm">
                        Scanner tidak tahu tamu mana yang harus divalidasi. Silakan pilih acara dari Dashboard Usher.
                    </p>
                    <Link href="/usher">
                        <Button className="w-full bg-amber-600 hover:bg-amber-700">
                            Kembali ke Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // --- RENDER UTAMA ---
    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center font-sans">
            
            {/* HEADER */}
            <div className="w-full max-w-md flex items-center justify-between mb-6">
                <Link href="/usher">
                    <Button variant="ghost" className="text-slate-300 hover:text-white px-0 gap-2">
                        <ArrowLeft className="w-5 h-5" /> Keluar
                    </Button>
                </Link>
                <div className="text-right">
                    <h1 className="font-bold text-base text-amber-500 truncate max-w-[200px]">{eventName}</h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Scanner Mode</p>
                </div>
            </div>

            {/* ALERT MESSAGE */}
            {message && (
                <div className={`w-full max-w-md p-3 mb-4 rounded-lg text-center font-bold text-sm shadow-lg animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
                    {message.text}
                </div>
            )}

            {/* AREA KERJA */}
            {!activeGuest ? (
                // MODE 1: SCANNING / INPUT
                <div className="w-full max-w-md space-y-6">
                    
                    {/* CAMERA CONTAINER */}
                    {isScanning ? (
                         <div className="overflow-hidden rounded-2xl border-2 border-slate-700 bg-black shadow-2xl relative">
                            <div id="reader" className="w-full h-auto min-h-[300px] bg-black"></div>
                            <div className="absolute top-4 right-4 bg-red-600/80 text-white px-2 py-1 rounded text-[10px] font-bold animate-pulse uppercase tracking-wider">
                                Live Camera
                            </div>
                            <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/70">
                                Arahkan kamera ke QR Code Tamu
                            </p>
                        </div>
                    ) : (
                        <div className="bg-slate-800 p-10 rounded-2xl text-center border border-slate-700">
                            <p className="text-slate-500 mb-4 text-sm">Kamera sedang dimatikan</p>
                            <Button onClick={() => setIsScanning(true)} variant="outline" className="border-slate-600 text-slate-300 hover:text-white">
                                Nyalakan Kamera
                            </Button>
                        </div>
                    )}

                    {/* MANUAL INPUT */}
                    <Card className="bg-slate-800 border-slate-700 shadow-lg">
                        <CardContent className="p-5 space-y-4">
                            <Label className="text-slate-400 text-xs uppercase tracking-widest">Atau Input Kode Manual</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input 
                                        type={showCode ? "text" : "password"} 
                                        placeholder="Contoh: A8X92" 
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                        className="bg-slate-900 border-slate-600 text-white pr-10 tracking-[0.2em] font-mono font-bold uppercase h-11"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCode(!showCode)} 
                                        className="absolute right-3 top-3 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showCode ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                    </button>
                                </div>
                                <Button 
                                    onClick={() => handleLookupGuest(manualCode)} 
                                    disabled={!manualCode || processing} 
                                    className="bg-amber-600 hover:bg-amber-700 h-11 w-11 p-0"
                                >
                                    <Search className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            ) : (
                // MODE 2: KONFIRMASI (POPUP)
                <Card className="w-full max-w-md bg-slate-800 border-slate-600 shadow-2xl animate-in zoom-in duration-300">
                    <CardHeader className="bg-slate-900/50 border-b border-slate-700 pb-4">
                        <CardTitle className="text-white flex items-center justify-center gap-2 text-lg">
                            <CheckCircle className="text-green-500 w-6 h-6" /> Konfirmasi Kehadiran
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">
                        
                        {/* Detail Tamu */}
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold text-amber-400">{activeGuest.name}</h2>
                            <div className="flex justify-center gap-2">
                                <span className={`px-3 py-1 rounded text-xs font-bold ${activeGuest.category === 'VIP' ? 'bg-amber-900/50 text-amber-400 border border-amber-700' : 'bg-slate-700 text-slate-300'}`}>
                                    {activeGuest.category || "Regular"}
                                </span>
                            </div>
                            {activeGuest.checkInTime && (
                                <p className="text-xs text-red-400 pt-2 italic">
                                    ⚠️ Sebelumnya check-in jam {new Date(activeGuest.checkInTime).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                                </p>
                            )}
                        </div>

                        {/* Input Jumlah */}
                        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 space-y-4">
                            <Label className="text-slate-400 text-xs uppercase tracking-widest text-center block">Jumlah Tamu Masuk (Pax)</Label>
                            <div className="flex items-center justify-center gap-6">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setInputActualPax(Math.max(1, inputActualPax - 1))}
                                    className="w-14 h-14 rounded-full text-2xl border-slate-600 hover:bg-slate-700 text-white"
                                >-</Button>
                                <div className="text-center w-16">
                                    <span className="text-5xl font-bold text-white">{inputActualPax}</span>
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setInputActualPax(inputActualPax + 1)}
                                    className="w-14 h-14 rounded-full text-2xl border-slate-600 hover:bg-slate-700 text-white"
                                >+</Button>
                            </div>
                        </div>

                        {/* Tombol Aksi */}
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="secondary" onClick={() => setActiveGuest(null)} className="bg-slate-700 hover:bg-slate-600 text-slate-200">
                                Batal
                            </Button>
                            <Button 
                                onClick={handleConfirmCheckIn} 
                                disabled={processing}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold tracking-wide shadow-lg shadow-green-900/20"
                            >
                                {processing ? "Menyimpan..." : "CHECK IN"}
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            )}
        </div>
    );
}