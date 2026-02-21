// File: app/(dashboard)/usher/scan/page.tsx
'use client';

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation"; 
import { Html5QrcodeScanner } from "html5-qrcode";
import { processCheckIn, getGuestByCode, getEventDetail } from "./actions"; // Import baru
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, AlertTriangle, Users, KeyRound, LogIn } from "lucide-react";
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

    // State Utama
    const [isScanning, setIsScanning] = useState(true);
    const [eventName, setEventName] = useState("Memuat...");
    const [activeGuest, setActiveGuest] = useState<any>(null);
    
    // State Transaksi
    const [inputPax, setInputPax] = useState(1);
    const [pin, setPin] = useState("");
    const [showPinInput, setShowPinInput] = useState(false);
    
    // State UI & Feedback
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
    const [checkInMode, setCheckInMode] = useState<'FIRST' | 'ADD'>('FIRST');

    // 1. Load Nama Acara
    useEffect(() => {
        if (!eventId) return;
        getEventDetail(eventId).then(d => d && setEventName(`${d.groomNick} & ${d.brideNick}`));
    }, [eventId]);

    // 2. Logic Scanner
    useEffect(() => {
        if (!isScanning || activeGuest || !eventId) return;
        const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
        
        scanner.render((decodedText) => {
            scanner.clear();
            setIsScanning(false);
            handleLookup(decodedText);
        }, () => {});

        return () => { scanner.clear().catch(() => {}); };
    }, [isScanning, activeGuest, eventId]);

    // HANDLER: Cari Tamu
    async function handleLookup(code: string) {
        if (!eventId) return;
        setProcessing(true); setMessage(null);
        
        const res = await getGuestByCode(code, eventId);
        setProcessing(false);

        if (res.error || !res.guest) {
            setMessage({ type: 'error', text: res.error || "Gagal" });
            setTimeout(() => setIsScanning(true), 2000); // Scan lagi otomatis
        } else {
            setActiveGuest(res.guest);
            // Reset State Transaksi
            setInputPax(1);
            setPin("");
            setShowPinInput(false);
            // Tentukan Mode Awal: Jika sudah check-in, set null dulu (tunggu user pilih menu)
            // Jika belum check-in, langsung mode FIRST
            setCheckInMode(res.guest.isCheckedIn ? 'ADD' : 'FIRST'); 
        }
    }

    // HANDLER: Submit Check-in
    async function handleSubmit() {
        if (!activeGuest) return;
        setProcessing(true);

        // Panggil Server Action Baru
        const res = await processCheckIn(activeGuest.id, inputPax, checkInMode, pin);

        setProcessing(false);

        if (res.error) {
            setMessage({ type: 'error', text: res.error });
            // Jika server minta PIN, tampilkan input PIN
            if ((res as any).requirePin) {
                setShowPinInput(true);
            }
        } else {
            // Sukses
            setMessage({ type: 'success', text: res.msg || "Sukses" });
            setTimeout(() => {
                setActiveGuest(null);
                setIsScanning(true);
            }, 2000);
        }
    }

    // LOGIC: Hitung Sisa & Over Capacity
    const maxAllocated = activeGuest?.totalPaxAllocated || 0;
    const currentRecorded = activeGuest?.pax || 0;
    
    // Prediksi Total Baru
    const projectedTotal = checkInMode === 'ADD' 
        ? currentRecorded + inputPax 
        : inputPax;
        
    const isOver = projectedTotal > maxAllocated;

    // --- RENDER UTAMA ---
    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 font-sans flex flex-col items-center">
             {/* HEADER SEDERHANA */}
            <div className="w-full max-w-md flex justify-between items-center mb-6">
                <Link href="/usher"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4"/> Keluar</Button></Link>
                <div className="text-amber-500 font-bold">{eventName}</div>
            </div>

            {/* ALERT BOX */}
            {message && (
                <div className={`w-full max-w-md p-4 mb-4 rounded-lg font-bold text-center ${message.type==='error'?'bg-red-600':'bg-green-600'}`}>
                    {message.text}
                </div>
            )}

            {/* AREA UTAMA */}
            {!activeGuest ? (
                // 1. TAMPILAN KAMERA / STANDBY
                <div className="w-full max-w-md bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
                    {isScanning ? (
                        <div id="reader" className="overflow-hidden rounded-lg"></div>
                    ) : (
                        <Button onClick={() => setIsScanning(true)}>Nyalakan Kamera</Button>
                    )}
                    <p className="mt-4 text-slate-400 text-sm">Scan QR Undangan</p>
                </div>
            ) : (
                // 2. TAMPILAN DETAIL TAMU & AKSI
                <Card className="w-full max-w-md bg-slate-800 border-slate-600">
                    <CardHeader className="bg-slate-950/50 pb-4 text-center">
                        <CardTitle className="text-xl text-amber-500">{activeGuest.name}</CardTitle>
                        <div className="flex justify-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-slate-700 text-xs rounded">Kategori: {activeGuest.category}</span>
                            <span className="px-2 py-1 bg-slate-700 text-xs rounded">Jatah: {activeGuest.totalPaxAllocated}</span>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 space-y-6">
                        
                        {/* JIKA SUDAH CHECK-IN SEBELUMNYA */}
                        {activeGuest.isCheckedIn && checkInMode === 'ADD' && !showPinInput && (
                            <div className="bg-blue-900/30 border border-blue-500/50 p-4 rounded-lg text-center space-y-3">
                                <div className="flex justify-center items-center gap-2 text-blue-400 font-bold">
                                    <CheckCircle className="w-5 h-5"/> Tamu Sudah Check-in
                                </div>
                                <p className="text-xs text-slate-300">
                                    Tercatat: {activeGuest.pax} orang pada {new Date(activeGuest.checkInTime).toLocaleTimeString('id-ID')}
                                </p>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Button variant="outline" onClick={() => { setActiveGuest(null); setIsScanning(true); }} className="border-slate-500 hover:bg-slate-700">
                                        <LogIn className="w-4 h-4 mr-2"/> Re-entry (Lewat)
                                    </Button>
                                    <Button onClick={() => setShowPinInput(true)} className="bg-amber-600 hover:bg-amber-700">
                                        <Users className="w-4 h-4 mr-2"/> + Tambah Orang
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* FORM INPUT PAX (Muncul jika belum checkin ATAU mode susulan aktif) */}
                        {(!activeGuest.isCheckedIn || showPinInput) && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className={`p-4 rounded-xl border ${isOver ? 'bg-red-900/20 border-red-500' : 'bg-slate-900 border-slate-700'}`}>
                                    <Label className="text-center block mb-4 text-xs uppercase tracking-widest text-slate-400">
                                        {checkInMode === 'ADD' ? 'Jumlah Tambahan (Susulan)' : 'Jumlah Tamu Masuk'}
                                    </Label>
                                    
                                    <div className="flex items-center justify-center gap-6">
                                        <Button variant="outline" onClick={() => setInputPax(Math.max(1, inputPax-1))} className="h-12 w-12 rounded-full text-xl">-</Button>
                                        <span className={`text-4xl font-bold ${isOver ? 'text-red-500' : 'text-white'}`}>{inputPax}</span>
                                        <Button variant="outline" onClick={() => setInputPax(inputPax+1)} className="h-12 w-12 rounded-full text-xl">+</Button>
                                    </div>

                                    {isOver && (
                                        <div className="mt-4 text-center text-red-400 text-xs font-bold flex flex-col items-center gap-1">
                                            <AlertTriangle className="w-5 h-5"/>
                                            <span>OVER CAPACITY! (Total: {projectedTotal}/{maxAllocated})</span>
                                            <span>Memerlukan PIN untuk lanjut.</span>
                                        </div>
                                    )}
                                </div>

                                {/* INPUT PIN (Otomatis muncul jika Over Quota atau Mode Susulan) */}
                                {(isOver || checkInMode === 'ADD') && (
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-amber-500">
                                            <KeyRound className="w-4 h-4"/> Masukkan PIN Keamanan
                                        </Label>
                                        <Input 
                                            type="password" 
                                            maxLength={4}
                                            placeholder="PIN 4 Digit"
                                            className="bg-black border-slate-600 text-center tracking-[1em] text-lg font-bold"
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                        />
                                        <p className="text-[10px] text-slate-500 text-right">*Minta PIN ke Admin/WO</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="ghost" onClick={() => setActiveGuest(null)} disabled={processing}>Batal</Button>
                                    <Button 
                                        onClick={handleSubmit} 
                                        disabled={processing || ((isOver || checkInMode === 'ADD') && pin.length < 4)}
                                        className={`${isOver ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                    >
                                        {processing ? "Menyimpan..." : (checkInMode === 'ADD' ? "SIMPAN SUSULAN" : "CHECK IN")}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}