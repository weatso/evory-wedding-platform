"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentPeriod = searchParams.get("period") || "all";
  const currentMonth = searchParams.get("month") || new Date().getMonth().toString();
  const currentYear = searchParams.get("year") || new Date().getFullYear().toString();
  const currentFrom = searchParams.get("from") || "";
  const currentTo = searchParams.get("to") || "";

  const [period, setPeriod] = useState(currentPeriod);
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [from, setFrom] = useState(currentFrom);
  const [to, setTo] = useState(currentTo);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const years = ["2026", "2027", "2028", "2029", "2030"];

  const handleApply = (newPeriod?: string, newMonth?: string, newYear?: string) => {
    const p = newPeriod ?? period;
    const m = newMonth ?? month;
    const y = newYear ?? year;

    if (p === "all") router.push(`/admin/finance`);
    else if (p === "month") router.push(`/admin/finance?period=month&month=${m}&year=${y}`);
    else if (p === "year") router.push(`/admin/finance?period=year&year=${y}`);
    else if (p === "custom" && from && to) router.push(`/admin/finance?period=custom&from=${from}&to=${to}`);
  };

  const handlePeriodChange = (val: string) => {
    setPeriod(val);
    if (val === "all") handleApply(val);
    // Don't auto-apply for others to allow user to select secondary dropdowns if they want, 
    // but actually auto-applying makes it feel snappy.
    else if (val === "month" || val === "year") handleApply(val, month, year);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-3 w-full">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">Periode:</span>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs font-bold bg-white border-slate-200 focus:ring-[#E5C185]">
            <SelectValue placeholder="Semua Waktu" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            <SelectItem value="all" className="text-xs font-bold cursor-pointer focus:bg-slate-50">Semua Waktu</SelectItem>
            <SelectItem value="month" className="text-xs font-bold cursor-pointer focus:bg-slate-50">Bulan Spesifik</SelectItem>
            <SelectItem value="year" className="text-xs font-bold cursor-pointer focus:bg-slate-50">Tahun Spesifik</SelectItem>
            <SelectItem value="custom" className="text-xs font-bold cursor-pointer focus:bg-slate-50 text-[#E5C185]">Rentang Tanggal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {period === "month" && (
        <div className="flex flex-row items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300 w-full sm:w-auto">
          <Select value={month} onValueChange={(v) => { setMonth(v); handleApply(period, v, year); }}>
            <SelectTrigger className="flex-1 sm:w-[120px] h-8 text-xs bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {months.map((m, i) => (
                <SelectItem key={i} value={i.toString()} className="text-xs">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={(v) => { setYear(v); handleApply(period, month, v); }}>
            <SelectTrigger className="w-[90px] h-8 text-xs bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {years.map(y => (
                <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {period === "year" && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300 w-full sm:w-auto">
          <Select value={year} onValueChange={(v) => { setYear(v); handleApply(period, month, v); }}>
            <SelectTrigger className="w-full sm:w-[100px] h-8 text-xs bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {years.map(y => (
                <SelectItem key={y} value={y} className="text-xs">Tahun {y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {period === "custom" && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300 w-full sm:w-auto">
          <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="flex-1 sm:w-auto h-8 px-2 text-xs border border-slate-200 rounded-md bg-white text-slate-600 focus:outline-none focus:border-[#E5C185]"
              />
              <span className="text-slate-400 text-xs shrink-0">-</span>
              <input 
                type="date" 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 sm:w-auto h-8 px-2 text-xs border border-slate-200 rounded-md bg-white text-slate-600 focus:outline-none focus:border-[#E5C185]"
              />
          </div>
          <button 
            onClick={() => handleApply()}
            disabled={!from || !to}
            className="w-full sm:w-auto h-8 px-4 text-xs font-bold bg-[#07303F] text-[#E5C185] rounded-md hover:bg-[#0a465c] disabled:opacity-50 transition-colors shrink-0"
          >
            Terapkan
          </button>
        </div>
      )}
    </div>
  );
}
