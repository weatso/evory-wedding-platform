"use client";

import { useEffect, useState } from "react";
import { getLiveAttendance } from "./actions";
import { Users, CheckCircle2, Loader2, Clock } from "lucide-react";

export default function LiveAttendanceClient({ projectId }: { projectId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchLive() {
    const res = await getLiveAttendance(projectId);
    if (res.success) {
      setData(res);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 5000); // Polling setiap 5 detik
    return () => clearInterval(interval);
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!data) return null;

  const progress = data.expectedPax > 0 ? Math.round((data.actualPax / data.expectedPax) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Kartu Metrik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#07303F] text-white p-6 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-[#E5C185] text-xs font-bold uppercase tracking-widest mb-1">Target Pax Hadir</p>
            <p className="text-4xl font-serif">{data.expectedPax}</p>
          </div>
          <Users className="w-16 h-16 text-white/10 absolute -right-2 -bottom-2" />
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Aktual Check-In</p>
            <p className="text-4xl font-serif text-[#07303F]">{data.actualPax}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Persentase Kedatangan</p>
          <div className="flex items-end gap-3 mb-2">
            <p className="text-4xl font-serif text-[#07303F]">{progress}%</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.min(progress, 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Tabel 10 Kedatangan Terakhir */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-[#07303F]">Riwayat Kedatangan Terbaru (Live)</h3>
        </div>
        
        {data.recentCheckIns.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Belum ada tamu yang check-in.
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F9F8F4]/50 border-b border-slate-100 text-[#07303F]">
              <tr>
                <th className="px-6 py-4 font-bold">Waktu</th>
                <th className="px-6 py-4 font-bold">Nama Tamu</th>
                <th className="px-6 py-4 font-bold">Kategori</th>
                <th className="px-6 py-4 font-bold text-right">Jumlah Pax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentCheckIns.map((guest: any) => (
                <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors animate-in fade-in slide-in-from-left-2">
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                    {new Date(guest.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#07303F]">{guest.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                      {guest.category || "Regular"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    +{guest.pax} Pax
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
