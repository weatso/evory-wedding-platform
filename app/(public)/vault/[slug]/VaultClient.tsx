"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Download, FileVideo, FileImage, File as FileIcon,
  Search, X, ChevronLeft, ChevronRight, Check,
  Eye, HardDrive, CheckSquare, Square, Play,
  Loader2, ArrowUp, Grid3X3, LayoutGrid, List,
  ArrowUpDown, Copy, CheckCheck, Columns3
} from "lucide-react";
import { Virtuoso, VirtuosoGrid } from "react-virtuoso";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type VaultFile = {
  name: string;
  url: string;
  size: string;
  sizeBytes: number;
  date: string;
  type: "video" | "image" | "document";
};

interface VaultStats {
  total: number;
  images: number;
  videos: number;
  documents: number;
}

interface VaultClientProps {
  eventName: string;
  initialStats: VaultStats;
}

type FilterType = "all" | "image" | "video" | "document";
type SortType = "name_asc" | "name_desc" | "size_asc" | "size_desc" | "date_desc" | "date_asc" | "type";
type GridMode = "grid-sm" | "grid-lg" | "masonry" | "list";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cache
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;
function cacheKey(slug: string, type: string, search: string, sort: string, page: number) {
  return `${slug}:${type}:${search}:${sort}:p${page}`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Hooks
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function useDebounce<T>(value: T, delay: number): T {
  const [d, setD] = useState(value);
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return d;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function VaultClient({ eventName, initialStats }: VaultClientProps) {
  // Core state
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [stats, setStats] = useState<VaultStats>(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("name_asc");
  const [gridMode, setGridMode] = useState<GridMode>("grid-sm");

  // Selection
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());

  // Preview
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Loading
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // UI state
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState<Map<number, boolean>>(new Map());
  const [copied, setCopied] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number; active: boolean } | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // ── Fetch ───────────────────────────────────────────────────────────
  const fetchPage = useCallback(async (page: number, append = false) => {
    if (!append) setIsLoading(true);
    else setIsLoadingMore(true);

    const key = cacheKey(eventName, activeFilter, debouncedSearch, sortBy, page);
    const cached = apiCache.get(key);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (append) setFiles(prev => [...prev, ...cached.data.files]);
      else setFiles(cached.data.files);
      if (cached.data.stats) setStats(cached.data.stats);
      setHasMore(cached.data.hasMore);
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasInitialLoad(true);
      return;
    }

    try {
      const params = new URLSearchParams({
        page: String(page), limit: "24",
        type: activeFilter, search: debouncedSearch, sort: sortBy,
      });
      const res = await fetch(`/api/vault/${encodeURIComponent(eventName)}?${params}`);
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      apiCache.set(key, { data, timestamp: Date.now() });

      if (append) setFiles(prev => [...prev, ...data.files]);
      else setFiles(data.files);
      if (data.stats) setStats(data.stats);
      setHasMore(data.hasMore);
    } catch {
      if (!append) setFiles([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasInitialLoad(true);
    }
  }, [eventName, activeFilter, debouncedSearch, sortBy]);

  // Reset on filter/search/sort change
  useEffect(() => {
    setFiles([]);
    setCurrentPage(1);
    setHasMore(true);
    setSelectedFiles(new Set());
    setImageLoadStates(new Map());
    fetchPage(1);
  }, [fetchPage]);

  // ── Infinite Scroll ─────────────────────────────────────────────────
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          const next = currentPage + 1;
          setCurrentPage(next);
          fetchPage(next, true);
        }
      },
      { rootMargin: "400px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, currentPage, isLoadingMore, isLoading, fetchPage]);

  // ── Scroll-to-top ───────────────────────────────────────────────────
  useEffect(() => {
    const h = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // ── Keyboard nav ────────────────────────────────────────────────────
  useEffect(() => {
    if (previewIndex === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewIndex(null);
      if (e.key === "ArrowLeft" && previewIndex > 0) setPreviewIndex(previewIndex - 1);
      if (e.key === "ArrowRight" && previewIndex < files.length - 1) setPreviewIndex(previewIndex + 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [previewIndex, files.length]);

  // ── Close sort menu on outside click ────────────────────────────────
  useEffect(() => {
    if (!showSortMenu) return;
    const h = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showSortMenu]);

  // ── Selection helpers ───────────────────────────────────────────────
  const toggleSelect = (idx: number) => {
    setSelectedFiles(prev => {
      const n = new Set(prev);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  };
  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length && files.length > 0) setSelectedFiles(new Set());
    else setSelectedFiles(new Set(files.map((_, i) => i)));
  };

  // ── Batch Download with Progress ────────────────────────────────────
  const handleBatchDownload = async () => {
    const indices = Array.from(selectedFiles);
    if (indices.length === 0) return;
    setDownloadProgress({ current: 0, total: indices.length, active: true });

    for (let i = 0; i < indices.length; i++) {
      if (!downloadProgress?.active && i > 0) break; // cancelled
      const file = files[indices[i]];
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadProgress(prev => prev ? { ...prev, current: i + 1 } : null);
      if (i < indices.length - 1) await new Promise(r => setTimeout(r, 400));
    }

    setTimeout(() => setDownloadProgress(null), 2000);
    setSelectedFiles(new Set());
  };

  // ── Download All ────────────────────────────────────────────────────
  const handleDownloadAll = async () => {
    try {
      const params = new URLSearchParams({
        all: "true", type: activeFilter, search: debouncedSearch, sort: sortBy,
      });
      const res = await fetch(`/api/vault/${encodeURIComponent(eventName)}?${params}`);
      const data = await res.json();
      const allFiles: { name: string; url: string }[] = data.files;

      setDownloadProgress({ current: 0, total: allFiles.length, active: true });

      for (let i = 0; i < allFiles.length; i++) {
        const a = document.createElement("a");
        a.href = allFiles[i].url;
        a.download = allFiles[i].name;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloadProgress(prev => prev ? { ...prev, current: i + 1 } : null);
        if (i < allFiles.length - 1) await new Promise(r => setTimeout(r, 400));
      }

      setTimeout(() => setDownloadProgress(null), 2000);
    } catch {
      setDownloadProgress(null);
    }
  };

  // ── Copy Link ───────────────────────────────────────────────────────
  const copyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Image load tracker ──────────────────────────────────────────────
  const onImageLoad = useCallback((idx: number) => {
    setImageLoadStates(prev => { const n = new Map(prev); n.set(idx, true); return n; });
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────
  const previewFile = previewIndex !== null ? files[previewIndex] : null;

  const filterButtons: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: stats.total },
    { key: "image", label: "Foto", count: stats.images },
    { key: "video", label: "Video", count: stats.videos },
    { key: "document", label: "Dokumen", count: stats.documents },
  ];

  const sortOptions: { key: SortType; label: string }[] = [
    { key: "name_asc", label: "Nama A → Z" },
    { key: "name_desc", label: "Nama Z → A" },
    { key: "size_desc", label: "Ukuran Terbesar" },
    { key: "size_asc", label: "Ukuran Terkecil" },
    { key: "date_desc", label: "Terbaru" },
    { key: "date_asc", label: "Terlama" },
    { key: "type", label: "Tipe File" },
  ];

  const gridModes: { key: GridMode; icon: React.ReactNode; label: string }[] = [
    { key: "grid-sm", icon: <Grid3X3 className="w-4 h-4" />, label: "Grid Kecil" },
    { key: "grid-lg", icon: <LayoutGrid className="w-4 h-4" />, label: "Grid Besar" },
    { key: "masonry", icon: <Columns3 className="w-4 h-4" />, label: "Masonry" },
    { key: "list", icon: <List className="w-4 h-4" />, label: "List" },
  ];

  const gridClasses: Record<GridMode, string> = {
    "grid-sm": "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3",
    "grid-lg": "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
    masonry: "",
    list: "flex flex-col gap-2",
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="min-h-screen bg-[#07303F] text-[#F9F8F4] selection:bg-[#E5C185] selection:text-[#07303F]">

      {/* ══════════ LIGHTBOX ══════════ */}
      {previewFile && previewIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col" onClick={() => setPreviewIndex(null)}>
          <div className="flex items-center justify-between p-4 md:p-6 shrink-0" onClick={e => e.stopPropagation()}>
            <div className="min-w-0 flex-1 mr-4">
              <p className="text-sm font-bold text-white truncate">{previewFile.name}</p>
              <p className="text-xs text-white/50 mt-0.5">{previewFile.size} • {previewFile.date}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={previewFile.url} download target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#E5C185] text-[#07303F] rounded-lg text-sm font-bold hover:bg-[#d4b074] transition-colors">
                <Download className="w-4 h-4" /> Download
              </a>
              <button onClick={() => setPreviewIndex(null)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative px-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            {previewIndex > 0 && (
              <button onClick={() => setPreviewIndex(previewIndex - 1)}
                className="absolute left-2 md:left-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm">
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}
            <div className="max-w-5xl max-h-[75vh] flex items-center justify-center">
              {previewFile.type === "image" ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" />
              ) : previewFile.type === "video" ? (
                <video src={previewFile.url} controls autoPlay className="max-w-full max-h-[75vh] rounded-lg shadow-2xl" />
              ) : (
                <div className="flex flex-col items-center gap-4 p-12 bg-white/5 rounded-2xl border border-white/10">
                  <FileIcon className="w-20 h-20 text-white/30" />
                  <p className="text-white/60 text-sm">Preview tidak tersedia</p>
                  <a href={previewFile.url} download target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-[#E5C185] text-[#07303F] rounded-lg text-sm font-bold hover:bg-[#d4b074] transition-colors">
                    <Download className="w-4 h-4" /> Download File
                  </a>
                </div>
              )}
            </div>
            {previewIndex < files.length - 1 && (
              <button onClick={() => setPreviewIndex(previewIndex + 1)}
                className="absolute right-2 md:right-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm">
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          </div>
          <div className="p-4 text-center shrink-0">
            <span className="text-xs text-white/40 font-mono">{previewIndex + 1} / {files.length}</span>
          </div>
        </div>
      )}

      {/* ══════════ DOWNLOAD PROGRESS MODAL ══════════ */}
      {downloadProgress && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#0a3d50] border border-[#E5C185]/20 rounded-2xl p-6 w-80 shadow-2xl">
            <p className="text-sm font-bold text-white mb-3">Downloading Files</p>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-[#E5C185] rounded-full transition-all duration-300"
                style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">
                {downloadProgress.current} / {downloadProgress.total} file
              </span>
              {downloadProgress.current < downloadProgress.total ? (
                <button onClick={() => setDownloadProgress(null)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Batal
                </button>
              ) : (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Selesai
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ AMBIENT BACKGROUND ══════════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[70vw] h-[70vw] bg-[#E5C185]/[0.04] blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[#4AAEC5]/[0.03] blur-[120px] rounded-full -translate-x-1/4 translate-y-1/4" />
      </div>

      {/* ══════════ HEADER ══════════ */}
      <div className="relative z-10 max-w-6xl mx-auto pt-12 md:pt-20 pb-4 px-4 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[#E5C185]/10 border border-[#E5C185]/20 rounded-xl">
            <HardDrive className="w-5 h-5 text-[#E5C185]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E5C185]/80">Media Vault</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif italic font-bold mb-3">
          {eventName.replace(/-/g, " ")}
        </h1>
        <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
          Seluruh aset beresolusi tinggi tersedia di bawah ini. Pilih file untuk preview atau download.
        </p>

        {/* Stats Pills */}
        <div className="flex flex-wrap gap-3 mt-6">
          {[
            { icon: <FileImage className="w-3.5 h-3.5" />, label: "Foto", count: stats.images },
            { icon: <FileVideo className="w-3.5 h-3.5" />, label: "Video", count: stats.videos },
            { icon: <FileIcon className="w-3.5 h-3.5" />, label: "Dokumen", count: stats.documents },
          ].map(s => s.count > 0 && (
            <div key={s.label} className="flex items-center gap-2 text-xs text-white/50 bg-white/5 rounded-full px-3 py-1.5 border border-white/5">
              {s.icon}<span>{s.count} {s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ COPY LINK BAR ══════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 mb-4">
        <div className="flex items-center gap-2 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold shrink-0">Link</span>
          <div className="w-px h-4 bg-white/10 shrink-0" />
          <p className="text-xs text-white/50 truncate flex-1 font-mono">
            vault/{eventName}
          </p>
          <button onClick={copyLink}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              copied
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white"
            }`}>
            {copied ? <><CheckCheck className="w-3 h-3" /> Tersalin</> : <><Copy className="w-3 h-3" /> Salin Link</>}
          </button>
        </div>
      </div>

      {/* ══════════ TOOLBAR ══════════ */}
      <div className="relative z-30 max-w-6xl mx-auto px-4 md:px-6 mb-6 sticky top-0">
        <div className="flex flex-col gap-3 p-4 bg-[#07303F]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-xl shadow-black/20">
          {/* Row 1: Filters + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {filterButtons.map(fb => fb.count > 0 && (
                <button key={fb.key} onClick={() => setActiveFilter(fb.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    activeFilter === fb.key
                      ? "bg-[#E5C185] text-[#07303F] shadow-lg shadow-[#E5C185]/20"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}>
                  {fb.label} <span className="ml-1 opacity-60">{fb.count}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-52">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="text" placeholder="Cari file..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-10 pr-10 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E5C185]/40 transition-colors" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Sort + Grid Mode + Select + Download All */}
          <div className="flex items-center justify-between gap-2 border-t border-white/[0.04] pt-3">
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <div ref={sortMenuRef} className="relative">
                <button onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{sortOptions.find(s => s.key === sortBy)?.label}</span>
                </button>
                {showSortMenu && (
                  <div className="absolute top-full left-0 mt-1 py-1 bg-[#0a3d50] border border-white/10 rounded-xl shadow-2xl shadow-black/40 z-50 min-w-[180px]">
                    {sortOptions.map(s => (
                      <button key={s.key}
                        onClick={() => { setSortBy(s.key); setShowSortMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                          sortBy === s.key
                            ? "text-[#E5C185] bg-[#E5C185]/10 font-bold"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid mode toggle */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                {gridModes.map(gm => (
                  <button key={gm.key} onClick={() => setGridMode(gm.key)} title={gm.label}
                    className={`p-1.5 transition-all ${
                      gridMode === gm.key
                        ? "bg-[#E5C185] text-[#07303F]"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}>
                    {gm.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Select All */}
              <button onClick={toggleSelectAll}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                title="Pilih semua">
                {selectedFiles.size === files.length && files.length > 0
                  ? <CheckSquare className="w-4 h-4 text-[#E5C185]" />
                  : <Square className="w-4 h-4" />}
              </button>

              {/* Download All */}
              <button onClick={handleDownloadAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/50 bg-white/5 border border-white/10 hover:bg-[#E5C185]/10 hover:text-[#E5C185] hover:border-[#E5C185]/30 transition-all"
                title="Download semua file">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download All</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ FILE GRID ══════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-32">
        {/* Skeleton */}
        {isLoading && !hasInitialLoad ? (
          <div className={gridClasses[gridMode === "masonry" ? "grid-lg" : gridMode]}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-white/[0.06] animate-pulse">
                <div className="aspect-square bg-white/[0.04]" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                  <div className="h-2.5 bg-white/[0.04] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : files.length === 0 && hasInitialLoad ? (
          <div className="py-24 flex flex-col items-center text-center">
            <HardDrive className="w-16 h-16 text-white/10 mb-4" />
            <p className="text-white/30 font-serif italic text-lg">
              {stats.total === 0 ? "Belum ada aset yang diunggah." : "Tidak ada file ditemukan."}
            </p>
            {(searchQuery || activeFilter !== "all") && (
              <button onClick={() => { setSearchQuery(""); setActiveFilter("all"); }}
                className="mt-4 text-xs text-[#E5C185] hover:underline">
                Hapus filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 1. LIST VIEW (VIRTUALIZED) */}
            {gridMode === "list" ? (
              <div className="bg-transparent rounded-xl flex flex-col h-full">
                {/* Header List */}
                <div className="hidden sm:grid grid-cols-[auto_1fr_80px_100px_80px] gap-4 px-4 py-2 text-[10px] text-white/30 uppercase tracking-wider font-bold border-b border-white/[0.06] mb-2">
                  <span className="w-5" />
                  <span>Nama File</span>
                  <span>Tipe</span>
                  <span>Ukuran</span>
                  <span className="text-right">Aksi</span>
                </div>
                
                {/* Mesin Virtuoso List */}
                <Virtuoso
                  useWindowScroll
                  totalCount={files.length}
                  endReached={() => {
                    if (hasMore && !isLoadingMore && !isLoading) {
                      const next = currentPage + 1;
                      setCurrentPage(next);
                      fetchPage(next, true);
                    }
                  }}
                  itemContent={(idx) => {
                    const file = files[idx];
                    const isSelected = selectedFiles.has(idx);
                    return (
                      <div className="pb-2">
                        <div className={`group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_80px_100px_80px] gap-4 items-center px-4 py-3 rounded-xl transition-all cursor-pointer ${
                            isSelected ? "bg-[#E5C185]/10 border border-[#E5C185]/30" : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/10"
                          }`}>
                          <button onClick={(e) => { e.stopPropagation(); toggleSelect(idx); }} className="shrink-0">
                            {isSelected ? <Check className="w-4 h-4 text-[#E5C185]" /> : <Square className="w-4 h-4 text-white/30 group-hover:text-white/50" />}
                          </button>
                          <div className="min-w-0 cursor-pointer" onClick={() => setPreviewIndex(idx)}>
                            <p className="text-sm text-white/80 truncate font-medium">{file.name}</p>
                            <p className="text-[10px] text-white/30 sm:hidden">{file.type} • {file.size}</p>
                          </div>
                          <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit ${
                            file.type === "video" ? "bg-blue-500/20 text-blue-300" : file.type === "image" ? "bg-pink-500/20 text-pink-300" : "bg-slate-500/20 text-slate-300"
                          }`}>{file.type === "video" ? "VID" : file.type === "image" ? "IMG" : "DOC"}</span>
                          <span className="hidden sm:block text-xs text-white/40">{file.size}</span>
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setPreviewIndex(idx)} className="p-1.5 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-all">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <a href={file.url} download target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-white/30 hover:text-[#E5C185] hover:bg-[#E5C185]/10 transition-all">
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            ) : gridMode === "masonry" ? (
              /* 2. MASONRY VIEW (NON-VIRTUALIZED) 
                 Catatan Arsitek: Mode Masonry CSS bawaan Tailwind (columns-x) tidak kompatibel dengan 
                 virtualisasi DOM karena menuntut browser menghitung seluruh tinggi file. Biarkan ini untuk galeri kecil. */
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 md:gap-4">
                {files.map((file, idx) => (
                  <MasonryCard key={`${file.name}-${idx}`} file={file} idx={idx}
                    isSelected={selectedFiles.has(idx)} isImageLoaded={!!imageLoadStates.get(idx)}
                    onSelect={toggleSelect} onPreview={setPreviewIndex} onImageLoad={onImageLoad} />
                ))}
                {/* Manual Observer untuk Infinite Scroll Masonry */}
                <div ref={sentinelRef} className="h-10 w-full clear-both" /> 
              </div>
            ) : (
              /* 3. GRID VIEW (VIRTUALIZED: sm & lg) */
              <VirtuosoGrid
                useWindowScroll
                totalCount={files.length}
                listClassName={gridClasses[gridMode]}
                itemClassName="flex w-full"
                endReached={() => {
                  if (hasMore && !isLoadingMore && !isLoading) {
                    const next = currentPage + 1;
                    setCurrentPage(next);
                    fetchPage(next, true);
                  }
                }}
                itemContent={(idx) => {
                  const file = files[idx];
                  return (
                    <div className="w-full pb-2 md:pb-3 h-full">
                      <GridCard file={file} idx={idx}
                        isSelected={selectedFiles.has(idx)} isImageLoaded={!!imageLoadStates.get(idx)}
                        onSelect={toggleSelect} onPreview={setPreviewIndex} onImageLoad={onImageLoad} />
                    </div>
                  );
                }}
              />
            )}

            {/* Indikator Loading Global */}
            <div className="py-8 flex flex-col items-center justify-center">
              {isLoadingMore && (
                <div className="flex items-center gap-3 text-white/40 text-sm bg-[#07303F] py-2 px-4 rounded-full shadow-lg border border-white/5">
                  <Loader2 className="w-5 h-5 animate-spin text-[#E5C185]" />
                  <span>Memuat lebih banyak file...</span>
                </div>
              )}
              {!hasMore && hasInitialLoad && files.length > 0 && (
                <p className="text-white/20 text-xs uppercase tracking-widest font-bold mt-4 border-t border-white/5 pt-4 w-1/2 text-center">
                  Semua file telah dimuat • {files.length} file
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ══════════ FLOATING BATCH BAR ══════════ */}
      {selectedFiles.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0a3d50]/95 border border-[#E5C185]/20 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-black/40 flex items-center gap-4 backdrop-blur-xl">
          <span className="text-sm font-bold text-[#E5C185]">{selectedFiles.size}</span>
          <span className="text-sm text-white/60">file dipilih</span>
          <div className="w-px h-5 bg-white/10" />
          <button onClick={handleBatchDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[#E5C185] text-[#07303F] rounded-xl text-sm font-bold hover:bg-[#d4b074] transition-colors shadow-lg shadow-[#E5C185]/20">
            <Download className="w-4 h-4" /> Download {selectedFiles.size > 1 ? `${selectedFiles.size} Files` : "File"}
          </button>
          <button onClick={() => setSelectedFiles(new Set())}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ══════════ SCROLL TO TOP ══════════ */}
      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-3 bg-[#E5C185] text-[#07303F] rounded-full shadow-xl shadow-[#E5C185]/20 hover:bg-[#d4b074] transition-all hover:scale-110"
          aria-label="Kembali ke atas">
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* ══════════ FOOTER ══════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-8">
        <div className="border-t border-white/[0.06] pt-6 flex items-center justify-center gap-2 text-[10px] text-white/20 uppercase tracking-widest">
          <HardDrive className="w-3 h-3" /><span>Powered by Evory Media Vault</span>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Grid Card Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function GridCard({ file, idx, isSelected, isImageLoaded, onSelect, onPreview, onImageLoad }: {
  file: VaultFile; idx: number; isSelected: boolean; isImageLoaded: boolean;
  onSelect: (i: number) => void; onPreview: (i: number) => void; onImageLoad: (i: number) => void;
}) {
  return (
    <div className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
      isSelected
        ? "border-[#E5C185] ring-2 ring-[#E5C185]/30 scale-[0.98]"
        : "border-white/[0.06] hover:border-white/20 hover:shadow-xl hover:shadow-black/20"
    }`}>
      <div className="aspect-square relative bg-white/[0.03] overflow-hidden" onClick={() => onPreview(idx)}>
        <ThumbnailContent file={file} idx={idx} isImageLoaded={isImageLoaded} onImageLoad={onImageLoad} />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 bg-white/10 backdrop-blur-sm rounded-full">
            <Eye className="w-5 h-5 text-white" />
          </div>
        </div>
        {/* Checkbox */}
        <button onClick={(e) => { e.stopPropagation(); onSelect(idx); }}
          className={`absolute top-2 left-2 z-10 p-1.5 rounded-lg transition-all duration-200 ${
            isSelected ? "bg-[#E5C185] text-[#07303F] shadow-lg"
              : "bg-black/40 text-white/70 backdrop-blur-sm opacity-0 group-hover:opacity-100"
          }`}>
          {isSelected ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        </button>
        {/* Type badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md backdrop-blur-sm ${
            file.type === "video" ? "bg-blue-500/30 text-blue-200 border border-blue-400/20"
              : file.type === "image" ? "bg-pink-500/30 text-pink-200 border border-pink-400/20"
              : "bg-slate-500/30 text-slate-200 border border-slate-400/20"
          }`}>{file.type === "video" ? "VID" : file.type === "image" ? "IMG" : "DOC"}</span>
        </div>
      </div>
      <div className="p-3 bg-white/[0.02]">
        <p className="text-xs font-medium text-white/80 truncate mb-1.5" title={file.name}>{file.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30">{file.size}</span>
          <a href={file.url} download target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-md text-white/30 hover:text-[#E5C185] hover:bg-[#E5C185]/10 transition-all">
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Masonry Card Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function MasonryCard({ file, idx, isSelected, isImageLoaded, onSelect, onPreview, onImageLoad }: {
  file: VaultFile; idx: number; isSelected: boolean; isImageLoaded: boolean;
  onSelect: (i: number) => void; onPreview: (i: number) => void; onImageLoad: (i: number) => void;
}) {
  return (
    <div className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer mb-3 md:mb-4 break-inside-avoid ${
      isSelected
        ? "border-[#E5C185] ring-2 ring-[#E5C185]/30"
        : "border-white/[0.06] hover:border-white/20 hover:shadow-xl hover:shadow-black/20"
    }`}>
      <div className="relative bg-white/[0.03] overflow-hidden" onClick={() => onPreview(idx)}>
        {file.type === "image" ? (
          <>
            {!isImageLoaded && <div className="aspect-[4/3] bg-white/[0.04] animate-pulse" />}
            <img src={file.url} alt={file.name}
              className={`w-full object-cover transition-all duration-700 group-hover:scale-105 ${isImageLoaded ? "opacity-100" : "opacity-0 absolute inset-0"}`}
              loading="lazy" decoding="async"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              onLoad={() => onImageLoad(idx)} />
          </>
        ) : (
          <div className="aspect-[4/3]">
            <ThumbnailContent file={file} idx={idx} isImageLoaded={isImageLoaded} onImageLoad={onImageLoad} />
          </div>
        )}
        {/* Checkbox */}
        <button onClick={(e) => { e.stopPropagation(); onSelect(idx); }}
          className={`absolute top-2 left-2 z-10 p-1.5 rounded-lg transition-all duration-200 ${
            isSelected ? "bg-[#E5C185] text-[#07303F] shadow-lg"
              : "bg-black/40 text-white/70 backdrop-blur-sm opacity-0 group-hover:opacity-100"
          }`}>
          {isSelected ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        </button>
        {/* Type badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md backdrop-blur-sm ${
            file.type === "video" ? "bg-blue-500/30 text-blue-200 border border-blue-400/20"
              : file.type === "image" ? "bg-pink-500/30 text-pink-200 border border-pink-400/20"
              : "bg-slate-500/30 text-slate-200 border border-slate-400/20"
          }`}>{file.type === "video" ? "VID" : file.type === "image" ? "IMG" : "DOC"}</span>
        </div>
      </div>
      <div className="p-3 bg-white/[0.02]">
        <p className="text-xs font-medium text-white/80 truncate" title={file.name}>{file.name}</p>
        <span className="text-[10px] text-white/30">{file.size}</span>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Thumbnail Content (shared between Grid and Masonry)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ThumbnailContent({ file, idx, isImageLoaded, onImageLoad }: {
  file: VaultFile; idx: number; isImageLoaded: boolean; onImageLoad: (i: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play video when in viewport, pause when out
  useEffect(() => {
    if (file.type !== "video" || !videoRef.current) return;
    const video = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "100px" }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [file.type]);

  if (file.type === "image") {
    return (
      <>
        {!isImageLoaded && <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />}
        <img src={file.url} alt={file.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy" decoding="async"
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          onLoad={() => onImageLoad(idx)} />
      </>
    );
  }

  if (file.type === "video") {
    return (
      <div className="w-full h-full relative bg-gradient-to-br from-slate-800 to-slate-900">
        <video ref={videoRef} src={file.url} muted loop playsInline preload="metadata"
          className="w-full h-full object-cover" />
        {/* Play icon overlay (subtle) */}
        <div className="absolute bottom-2 right-2 p-1.5 bg-black/50 backdrop-blur-sm rounded-full">
          <Play className="w-3 h-3 text-white/80 ml-0.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50">
      <FileIcon className="w-12 h-12 text-white/15" />
    </div>
  );
}
