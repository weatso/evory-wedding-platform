"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { processCheckIn } from "./actions";
import { Loader2, CheckCircle2, XCircle, AlertCircle, Camera, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ScannerClient({ projectId }: { projectId: string }) {
  const [mode, setMode] = useState<"CAMERA" | "MANUAL">("CAMERA");
  const [manualCode, setManualCode] = useState("");
  const [paxInput, setPaxInput] = useState<string>("1");
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    
    setLoading(true);
    setScanResult(null);

    try {
      const pax = parseInt(paxInput);
      const res = await processCheckIn(manualCode.trim().toUpperCase(), projectId, isNaN(pax) ? undefined : pax);
      setScanResult(res);
      
      if (res.success) {
        audioRef.current?.play().catch(e => console.log("Audio play failed:", e));
        setManualCode(""); // reset on success
      }
    } catch (err) {
      setScanResult({ error: "Terjadi kesalahan jaringan." });
    } finally {
      setLoading(false);
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  useEffect(() => {
    // Setup Audio
    audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3"); // Simple ding sound
    
    if (mode === "CAMERA") {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      );

      let isProcessing = false;

      scannerRef.current.render(
        async (decodedText) => {
          if (isProcessing) return; // Prevent multiple scans at once
          isProcessing = true;
          
          setLoading(true);
          setScanResult(null);

          try {
            // Kita tidak tahu pax aktual jika via scanner otomatis, jadi kirim undefined
            const res = await processCheckIn(decodedText, projectId);
            setScanResult(res);
            
            if (res.success) {
              audioRef.current?.play().catch(e => console.log("Audio play failed:", e));
            }
          } catch (err) {
            setScanResult({ error: "Terjadi kesalahan jaringan." });
          } finally {
            setLoading(false);
            setTimeout(() => {
              isProcessing = false;
              setScanResult(null);
            }, 3000);
          }
        },
        (error) => {
          // Ignore normal scan errors
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
        scannerRef.current = null;
      }
    };
  }, [projectId, mode]);

  return (
    <div className="space-y-4">
      {/* TAB TOGGLE */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full">
        <button 
          onClick={() => setMode("CAMERA")} 
          className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === "CAMERA" ? "bg-white shadow-sm text-[#07303F]" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Camera className="w-4 h-4" /> Kamera Scanner
        </button>
        <button 
          onClick={() => setMode("MANUAL")} 
          className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mode === "MANUAL" ? "bg-white shadow-sm text-[#07303F]" : "text-slate-500 hover:text-slate-700"}`}
        >
          <Keyboard className="w-4 h-4" /> Input Manual
        </button>
      </div>

      {/* Container untuk Scanner atau Manual Form */}
      <div className="overflow-hidden rounded-xl bg-slate-900 min-h-[300px] aspect-square relative flex items-center justify-center">
        
        {mode === "CAMERA" ? (
          <div id="reader" className="w-full h-full [&>div]:border-none [&_video]:object-cover" />
        ) : (
          <div className="w-full p-6 text-white text-center">
            <Keyboard className="w-12 h-12 text-[#E5C185] mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-6">Input Kode Manual</h3>
            <form onSubmit={handleManualCheckIn} className="space-y-4 max-w-xs mx-auto">
              <div className="text-left space-y-1">
                 <label className="text-xs text-slate-400 font-bold uppercase">Guest Code (4 Digit)</label>
                 <Input 
                   autoFocus
                   value={manualCode} 
                   onChange={(e) => setManualCode(e.target.value)} 
                   placeholder="Msl: A1B2" 
                   className="bg-slate-800 border-slate-700 text-center uppercase tracking-widest text-lg h-12 text-white" 
                 />
              </div>
              <div className="text-left space-y-1">
                 <label className="text-xs text-slate-400 font-bold uppercase">Pax Hadir (Orang)</label>
                 <Input 
                   type="number" 
                   min="1"
                   value={paxInput} 
                   onChange={(e) => setPaxInput(e.target.value)} 
                   className="bg-slate-800 border-slate-700 text-center text-lg h-12 text-white" 
                 />
              </div>
              <Button type="submit" disabled={!manualCode || loading} className="w-full bg-[#E5C185] hover:bg-[#d4b074] text-[#07303F] font-bold h-12">
                 Check In
              </Button>
            </form>
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
            <Loader2 className="w-10 h-10 animate-spin mb-2 text-[#E5C185]" />
            <p className="text-sm font-bold animate-pulse">Memvalidasi Data...</p>
          </div>
        )}

        {scanResult && !loading && (
          <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center text-white backdrop-blur-md transition-all duration-300 ${
            scanResult.success ? "bg-green-600/90" : 
            scanResult.alreadyCheckedIn ? "bg-amber-500/90" : "bg-red-600/90"
          }`}>
            {scanResult.success ? (
              <>
                <CheckCircle2 className="w-16 h-16 mb-4 text-green-200" />
                <h3 className="text-2xl font-bold mb-1">Berhasil!</h3>
                <p className="text-lg">{scanResult.guestName}</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full text-sm">
                  <span className="font-bold">{scanResult.pax} Pax</span>
                  <span>•</span>
                  <span>{scanResult.category}</span>
                </div>
              </>
            ) : scanResult.alreadyCheckedIn ? (
              <>
                <AlertCircle className="w-16 h-16 mb-4 text-amber-200" />
                <h3 className="text-xl font-bold mb-1">Sudah Check-In</h3>
                <p>{scanResult.guestName}</p>
                <p className="text-sm mt-2 opacity-80">{scanResult.error}</p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 mb-4 text-red-200" />
                <h3 className="text-xl font-bold mb-1">Ditolak</h3>
                <p className="text-sm opacity-90">{scanResult.error}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-400">
        Pastikan memberikan izin akses kamera pada browser Anda.
      </div>
    </div>
  );
}
