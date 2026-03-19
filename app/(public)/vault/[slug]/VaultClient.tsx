"use client";

import Image from "next/image";
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import {
  Archive,
  ArrowUp,
  ArrowUpDown,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Eye,
  File as FileIcon,
  FileImage,
  FileVideo,
  Grid3X3,
  HardDrive,
  LayoutGrid,
  List,
  Loader2,
  PlayCircle,
  Search,
  Square,
  X
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
type GridMode = "grid-sm" | "grid-lg" | "list";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cache
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;
function cacheKey(eventName: string, type: string, search: string, sort: string, folder: string, page: number) {
  return `${eventName}:${type}:${search}:${sort}:${folder}:p${page}`;
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
  const [gridMode, setGridMode] = useState<GridMode>("grid-lg");
  const [selectAllMode, setSelectAllMode] = useState<"none" | "project_filtered" | "project_all">("none");
  const [isZipping, setIsZipping] = useState(false);

  type FolderType = "all" | "highlight" | "raw";
  const [activeFolder, setActiveFolder] = useState<FolderType>("all");

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
  const [isDownloadingSingle, setIsDownloadingSingle] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // ── Force Download (iOS compatible) ─────────────────────────────────
  const forceDownload = useCallback(async (url: string, filename: string) => {
    if (isDownloadingSingle) return; // Cegah spam klik
    setIsDownloadingSingle(url);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network error");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Bersihkan memori
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error("Gagal mode Blob, fallback ke Tab Baru:", error);
      window.open(url, "_blank");
    } finally {
      setIsDownloadingSingle(null);
    }
  }, [isDownloadingSingle]);

  // ── Fetch ───────────────────────────────────────────────────────────
  const fetchPage = useCallback(async (page: number, append = false) => {
    if (!append) setIsLoading(true);
    else setIsLoadingMore(true);

    // KUNCI CACHE DIPERBARUI
    const key = cacheKey(eventName, activeFilter, debouncedSearch, sortBy, activeFolder, page);
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
      // PARAMETER FOLDER DIKIRIM KE BACKEND
      const params = new URLSearchParams({
        page: String(page), limit: "24",
        type: activeFilter, search: debouncedSearch, sort: sortBy,
        folder: activeFolder !== "all" ? activeFolder : ""
      });
      const res = await fetch(`/api/vault/${encodeURIComponent(eventName)}?${params}`);

      // ... (biarkan kode fetch sukses sama seperti sebelumnya) ...
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
  }, [eventName, activeFilter, debouncedSearch, sortBy, activeFolder]); // <-- WAJIB ADA 'activeFolder' DI SINI

  // Reset on filter/search/sort change
  useEffect(() => {
    setFiles([]);
    setCurrentPage(1);
    setHasMore(true);
    setSelectedFiles(new Set());
    setCopied(false);
    setSelectAllMode("none");
    setImageLoadStates(new Map());
    fetchPage(1);
  }, [fetchPage]);

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
    if (selectAllMode !== "none") {
      setSelectAllMode("none");
      const allLoadedIndices = new Set(files.map((_, i) => i));
      allLoadedIndices.delete(idx);
      setSelectedFiles(allLoadedIndices);
      return;
    }
    setSelectedFiles(prev => {
      const n = new Set(prev);
      n.has(idx) ? n.delete(idx) : n.add(idx);
      return n;
    });
  };

  const handleSelectAllToggle = () => {
    if (selectAllMode !== "none") {
      setSelectAllMode("none");
      setSelectedFiles(new Set());
    } else {
      setSelectAllMode("project_filtered");
      const allLoadedIndices = new Set(files.map((_, i) => i));
      setSelectedFiles(allLoadedIndices);
    }
  };

  // ── Fetch all files from API (for Select All download) ──────────────
  const fetchAllFiles = useCallback(async (ignoreFilters: boolean): Promise<{ name: string; url: string; type: string; size: string }[]> => {
    const params = new URLSearchParams({
      all: "true",
      type: ignoreFilters ? "all" : activeFilter,
      search: ignoreFilters ? "" : debouncedSearch,
      sort: sortBy,
      folder: ignoreFilters ? "all" : (activeFolder !== "all" ? activeFolder : ""),
    });
    const res = await fetch(`/api/vault/${encodeURIComponent(eventName)}?${params}`);
    if (!res.ok) throw new Error("Gagal mengambil daftar file");
    const data = await res.json();
    return data.files;
  }, [eventName, activeFilter, debouncedSearch, sortBy, activeFolder]);

  // ── Bulk Download / ZIP ─────────────────────────────────────────────
  const handleBulkDownload = async (format: "individual" | "zip") => {
    if (selectedFiles.size === 0 && selectAllMode === "none") return alert("Pilih minimal 1 file.");

    let filesToDownload: { name: string; url: string; type?: string; size?: string }[];

    // Jika "Pilih Semua" aktif, ambil SEMUA file dari server (bukan hanya yang sudah di-load)
    if (selectAllMode !== "none") {
      try {
        setIsZipping(true); // Tampilkan loading saat mengambil daftar
        filesToDownload = await fetchAllFiles(selectAllMode === "project_all");
      } catch (error) {
        console.error("Gagal mengambil semua file:", error);
        alert("Gagal mengambil daftar file dari server.");
        setIsZipping(false);
        return;
      }
    } else {
      filesToDownload = Array.from(selectedFiles).map(idx => files[idx]);
    }

    if (format === "zip") {
      if (selectAllMode === "none") setIsZipping(true); // Jika selectAllMode !== "none", sudah true dari atas
      try {
        const CHUNK_SIZE = 30; // Batas aman RAM Browser
        const chunks = [];
        for (let i = 0; i < filesToDownload.length; i += CHUNK_SIZE) {
          chunks.push(filesToDownload.slice(i, i + CHUNK_SIZE));
        }

        if (chunks.length > 1) {
          alert(`Sistem mendeteksi volume file besar (${filesToDownload.length} file). Untuk mencegah perangkat Anda mati, sistem akan otomatis membaginya menjadi ${chunks.length} bagian ZIP. Mohon jangan tutup halaman ini sampai semua bagian selesai diunduh.`);
        }

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const zip = new JSZip();

          const fetchPromises = chunk.map(async (file) => {
            const response = await fetch(file.url);
            const blob = await response.blob();
            zip.file(file.name, blob);
          });

          await Promise.all(fetchPromises);
          const content = await zip.generateAsync({ type: "blob" });

          const partLabel = chunks.length > 1 ? `-Part_${i + 1}` : "";
          saveAs(content, `${eventName.replace(/-/g, "_")}${partLabel}.zip`);

          // Jeda pernapasan memori 2 detik antar ZIP agar Safari tidak memblokir spam unduhan
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      } catch (error) {
        console.error("ZIP Error:", error);
        alert("Gagal mengompresi file. Pastikan ruang penyimpanan perangkat Anda cukup.");
      } finally {
        setIsZipping(false);
        setSelectedFiles(new Set());
        setSelectAllMode("none");
      }
    } else {
      setIsZipping(false); // Reset jika sebelumnya di-set saat fetchAllFiles
      // Remove alert to prevent prompt spam loop
      for (let i = 0; i < filesToDownload.length; i++) {
        const file = filesToDownload[i];

        // Gunakan Blob fetching untuk setiap file agar iOS dipaksa mengunduh
        try {
          const response = await fetch(file.url);
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        } catch (error) {
          console.error("Gagal mengunduh", file.name);
        }

        // Jeda 800ms tetap wajib agar Safari tidak membekukan antrean
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setSelectedFiles(new Set());
      setSelectAllMode("none");
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
    { key: "list", icon: <List className="w-4 h-4" />, label: "List" },
  ];

  const gridClasses: Record<GridMode, string> = {
    "grid-sm": "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3",
    "grid-lg": "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
    list: "flex flex-col gap-1.5 sm:gap-2",
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#07303F] text-[#F9F8F4] selection:bg-[#E5C185] selection:text-[#07303F]">

      {/* ══════════ LIGHTBOX (Mempertahankan Player Video Anda) ══════════ */}
      {previewFile && previewIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col" onClick={() => setPreviewIndex(null)}>
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 shrink-0" onClick={e => e.stopPropagation()}>
            <div className="min-w-0 flex-1 mr-2 sm:mr-4">
              <p className="text-xs sm:text-sm font-bold text-white truncate">{previewFile.name}</p>
              <p className="text-[10px] sm:text-xs text-white/50 mt-0.5">{previewFile.size} • {previewFile.date}</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button onClick={() => setPreviewIndex(null)} className="p-1.5 sm:p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 sm:w-5 h-4 sm:h-5" />
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
                  <button 
                onClick={(e) => {
                  e.stopPropagation();
                  forceDownload(previewFile.url, previewFile.name);
                }}
                disabled={isDownloadingSingle === previewFile.url}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#E5C185] text-[#07303F] rounded-lg text-xs sm:text-sm font-bold hover:bg-[#d4b074] transition-colors disabled:opacity-50">
                {isDownloadingSingle === previewFile.url ? (
                  <Loader2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 animate-spin" />
                ) : (
                  <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> 
                )}
                <span className="hidden sm:inline">
                  {isDownloadingSingle === previewFile.url ? "Mengunduh..." : "Download"}
                </span>
              </button>
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

      {/* ══════════ AMBIENT BACKGROUND ══════════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[70vw] h-[70vw] bg-[#E5C185]/[0.04] blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[#4AAEC5]/[0.03] blur-[120px] rounded-full -translate-x-1/4 translate-y-1/4" />
      </div>

      {/* ══════════ HEADER IDENTITAS EVORY ══════════ */}
      <div className="relative z-10 max-w-6xl mx-auto pt-8 sm:pt-12 md:pt-20 pb-4 px-4 md:px-6 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-4">

            {/* Logo Asli Evory */}
            <div className="w-12 sm:w-20 h-12 sm:h-20 rounded-full border border-[#E5C185]/30 flex items-center justify-center bg-[#07303F] shadow-[0_0_20px_rgba(229,193,133,0.15)] shrink-0 relative overflow-hidden">
              <Image src="/logo/logo-emblem.png" alt="Evory Logo" fill className="object-contain p-2 sm:p-3" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E5C185]/80">Evory Media Vault</span>
              </div>
              {/* Ukuran Judul Dibesarkan Secara Masif */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif italic font-bold break-words leading-tight tracking-tight max-w-3xl">
                {eventName.replace(/-/g, " ")}
              </h1>
            </div>
          </div>


        </div>
      </div>

      {/* ══════════ COPY LINK BAR ══════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 md:px-6 mb-4 overflow-hidden">
        <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl min-w-0">
          <span className="text-[10px] text-white/30 uppercase tracking-wider font-bold shrink-0">Project</span>
          <div className="w-px h-4 bg-white/10 shrink-0" />
          <p className="text-[10px] sm:text-xs text-[#E5C185] truncate flex-1 min-w-0 font-bold">
            {eventName.replace(/-/g, " ")}
          </p>
          <button onClick={copyLink}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all shrink-0 ${copied
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white"
              }`}>
            {copied ? <><CheckCheck className="w-3 h-3" /> Tersalin</> : <><Copy className="w-3 h-3" /> Salin Link</>}
          </button>
        </div>
      </div>

      {/* ══════════ FOLDER NAVIGATION (HIGHLIGHT & RAW) ══════════ */}
      <div className="relative z-20 max-w-6xl mx-auto px-3 sm:px-4 md:px-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 p-1.5 bg-[#07303F]/80 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl w-fit">
          {[
            { id: "all", label: "Semua File", icon: <HardDrive className="w-4 h-4 mb-1" /> },
            { id: "highlight", label: "Highlight", icon: <CheckCheck className="w-4 h-4 mb-1 text-green-400" /> },
            { id: "raw", label: "Raw Collection", icon: <Archive className="w-4 h-4 mb-1 text-blue-400" /> }
          ].map((folder) => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id as FolderType)}
              className={`relative flex flex-col items-center justify-center px-6 sm:px-8 py-3 rounded-lg transition-all duration-300 ${activeFolder === folder.id
                  ? "bg-[#E5C185] text-[#07303F] shadow-lg shadow-[#E5C185]/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
            >
              {folder.icon}
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">{folder.label}</span>

              {/* Indikator Titik Aktif */}
              {activeFolder === folder.id && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#E5C185] animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ TOOLBAR ══════════ */}
      <div className="relative z-30 max-w-6xl mx-auto px-3 sm:px-4 md:px-6 mb-4 sm:mb-6 sticky top-0 overflow-hidden">
        <div className="flex flex-col gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-[#07303F]/95 backdrop-blur-xl border border-white/[0.06] rounded-xl sm:rounded-2xl shadow-xl shadow-black/20">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {filterButtons.map(fb => fb.count > 0 && (
                <button key={fb.key} onClick={() => setActiveFilter(fb.key)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeFilter === fb.key
                    ? "bg-[#E5C185] text-[#07303F] shadow-lg shadow-[#E5C185]/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}>
                  {fb.label} <span className="ml-1 opacity-60">{fb.count}</span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-48 md:w-52">
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-white/[0.04] pt-3 sm:pt-4 mt-1 sm:mt-2">
            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <div ref={sortMenuRef} className="relative">
                <button onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{sortOptions.find(s => s.key === sortBy)?.label}</span>
                </button>
                {showSortMenu && (
                  <div className="absolute top-full left-0 mt-1 py-1 bg-[#0a3d50] border border-white/10 rounded-xl shadow-2xl shadow-black/40 z-50 min-w-[180px]">
                    {sortOptions.map(s => (
                      <button key={s.key}
                        onClick={() => { setSortBy(s.key); setShowSortMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors ${sortBy === s.key
                          ? "text-[#E5C185] bg-[#E5C185]/10 font-bold"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid Mode Toggles */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden ml-auto sm:ml-0">
                {gridModes.map(gm => (
                  <button key={gm.key} onClick={() => setGridMode(gm.key)} title={gm.label}
                    className={`p-1.5 transition-all ${gridMode === gm.key
                      ? "bg-[#E5C185] text-[#07303F]"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                      }`}>
                    {gm.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-none border-white/5 pt-3 sm:pt-0 mt-1 sm:mt-0">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] sm:text-xs text-white/60 hover:text-white transition-colors">
                <input type="checkbox" checked={selectAllMode !== "none" || (selectedFiles.size === files.length && files.length > 0)} onChange={handleSelectAllToggle} className="rounded border-white/20 bg-transparent text-[#E5C185] focus:ring-[#E5C185]" />
                Pilih Semua
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ FILE GRID ══════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pb-24 sm:pb-32">
        {isLoading && !hasInitialLoad ? (
          gridMode === "list" ? (
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl border border-white/[0.04] animate-pulse">
                  <div className="w-4 h-4 bg-white/[0.06] rounded shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-3.5 bg-white/[0.06] rounded w-3/4" />
                    <div className="h-2.5 bg-white/[0.04] rounded w-1/3 sm:hidden" />
                  </div>
                  <div className="hidden sm:block h-3 bg-white/[0.06] rounded w-12" />
                  <div className="hidden sm:block h-3 bg-white/[0.04] rounded w-16" />
                  <div className="flex gap-1">
                    <div className="w-7 h-7 bg-white/[0.04] rounded-md" />
                    <div className="w-7 h-7 bg-white/[0.04] rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={gridClasses[gridMode]}>
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
          )
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
            {gridMode === "list" ? (
              <div className="bg-transparent rounded-xl flex flex-col h-full">
                <div className="hidden sm:grid grid-cols-[auto_1fr_60px_80px_70px] md:grid-cols-[auto_1fr_80px_100px_80px] gap-3 md:gap-4 px-3 sm:px-4 py-2 text-[10px] text-white/30 uppercase tracking-wider font-bold border-b border-white/[0.06] mb-1 sm:mb-2">
                  <span className="w-5" />
                  <span>Nama File</span>
                  <span>Tipe</span>
                  <span>Ukuran</span>
                  <span className="text-right">Aksi</span>
                </div>
                <Virtuoso
                  useWindowScroll
                  totalCount={files.length}
                  overscan={750}
                  endReached={() => {
                    if (hasMore && !isLoadingMore && !isLoading) {
                      const next = currentPage + 1;
                      setCurrentPage(next);
                      fetchPage(next, true);
                    }
                  }}
                  itemContent={(idx) => {
                    const file = files[idx];
                    const isSelected = selectedFiles.has(idx) || selectAllMode !== "none";
                    return (
                      <div className="pb-1 sm:pb-2">
                        <div className={`group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_60px_80px_70px] md:grid-cols-[auto_1fr_80px_100px_80px] gap-2 sm:gap-3 md:gap-4 items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all cursor-pointer ${isSelected ? "bg-[#E5C185]/10 border border-[#E5C185]/30" : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/10"
                          }`}>
                          <button onClick={(e) => { e.stopPropagation(); toggleSelect(idx); }} className="shrink-0">
                            {isSelected ? <Check className="w-4 h-4 text-[#E5C185]" /> : <Square className="w-4 h-4 text-white/30 group-hover:text-white/50" />}
                          </button>
                          <div className="min-w-0 cursor-pointer" onClick={() => setPreviewIndex(idx)}>
                            <p className="text-sm text-white/80 truncate font-medium">{file.name}</p>
                            <p className="text-[10px] text-white/30 sm:hidden">{file.type} • {file.size}</p>
                          </div>
                          <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit ${file.type === "video" ? "bg-blue-500/20 text-blue-300" : file.type === "image" ? "bg-pink-500/20 text-pink-300" : "bg-slate-500/20 text-slate-300"
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
            ) : (
              <VirtuosoGrid
                useWindowScroll
                totalCount={files.length}
                overscan={750}
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
                        isSelected={selectedFiles.has(idx) || selectAllMode !== "none"}
                        isImageLoaded={!!imageLoadStates.get(idx)}
                        onSelect={toggleSelect} onPreview={setPreviewIndex} onImageLoad={onImageLoad}
                        onForceDownload={forceDownload} // Passing fungsi
                      />
                    </div>
                  );
                }}
              />
            )}

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
      {(selectedFiles.size > 0 || selectAllMode !== "none") && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto bg-[#0a3d50]/95 border border-[#E5C185]/20 text-white px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/40 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 backdrop-blur-xl">
          
          <div className="flex items-center justify-between w-full sm:w-auto border-b sm:border-b-0 border-white/10 pb-2 sm:pb-0">
            <span className="text-xs sm:text-sm font-bold text-[#E5C185] whitespace-nowrap">
              {selectAllMode === "project_all" 
                ? `Semua (${stats.total}) file di project` 
                : selectAllMode === "project_filtered"
                ? `Semua file di filter ini`
                : `${selectedFiles.size} file`} dipilih
            </span>
            <button onClick={() => { setSelectedFiles(new Set()); setSelectAllMode("none"); }} className="p-1 sm:hidden text-white/50 hover:text-white rounded">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center w-full gap-2 sm:border-l border-white/10 sm:pl-4 justify-between sm:justify-end">
            {selectAllMode === "project_filtered" && (
              <button onClick={() => setSelectAllMode("project_all")} className="text-[10px] sm:text-xs text-[#E5C185] hover:text-white font-medium px-2 py-1.5 rounded bg-white/5 whitespace-nowrap hidden sm:inline-block">
                Pilih semua ({stats.total}) di project
              </button>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              <button onClick={() => handleBulkDownload("individual")}
                className="flex items-center justify-center h-7 sm:h-9 px-3 sm:px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap">
                <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Satuan</span>
              </button>

              <button onClick={() => handleBulkDownload("zip")} disabled={isZipping}
                className="flex items-center justify-center h-7 sm:h-9 px-3 sm:px-4 bg-[#E5C185] hover:bg-[#d4b074] text-[#07303F] font-bold rounded-lg sm:rounded-xl text-xs sm:text-sm transition-colors disabled:opacity-50 whitespace-nowrap">
                {isZipping ? <Loader2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 sm:mr-1.5 animate-spin" /> : <Archive className="w-3.5 sm:w-4 h-3.5 sm:h-4 sm:mr-1.5" />}
                <span className="hidden sm:inline">{isZipping ? "Memproses..." : "ZIP"}</span>
                <span className="sm:hidden">ZIP</span>
              </button>

              <button onClick={() => { setSelectedFiles(new Set()); setSelectAllMode("none"); }}
                className="hidden sm:flex p-1.5 sm:p-2.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors shrink-0">
                <X className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
          </div>
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
function GridCard({ file, idx, isSelected, isImageLoaded, onSelect, onPreview, onImageLoad, onForceDownload }: {
  file: VaultFile; idx: number; isSelected: boolean; isImageLoaded: boolean;
  onSelect: (i: number) => void; onPreview: (i: number) => void; onImageLoad: (i: number) => void;
  onForceDownload: (url: string, name: string) => void; // Tambahan props
}) {
  return (
    <div className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${isSelected
      ? "border-[#E5C185] ring-2 ring-[#E5C185]/30 scale-[0.98]"
      : "border-white/[0.06] hover:border-white/20 hover:shadow-xl hover:shadow-black/20"
      }`}>
      <div className="aspect-square relative bg-[#07303F] overflow-hidden" onClick={() => onPreview(idx)}>
        <ThumbnailContent file={file} idx={idx} isImageLoaded={isImageLoaded} onImageLoad={onImageLoad} />

        {/* Layer Hover Bersih: Eye Icon dihapus agar tidak bentrok */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 pointer-events-none" />

        <button onClick={(e) => { e.stopPropagation(); onSelect(idx); }}
          className={`absolute top-2 left-2 z-10 p-1.5 rounded-lg transition-all duration-200 ${isSelected ? "bg-[#E5C185] text-[#07303F] shadow-lg"
            : "bg-black/40 text-white/70 backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100"
            }`}>
          {isSelected ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="p-3 bg-white/[0.02]">
        <p className="text-xs font-medium text-white/80 truncate mb-1.5" title={file.name}>{file.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/30">{file.size}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Jika ini komponen anak, Anda harus mem-passing forceDownload sebagai props, 
              // ATAU biarkan fungsi forceDownload global di dalam file.
              // Karena di arsitektur Anda GridCard ada di luar VaultClient, ubah arsitekturnya sedikit:
              onForceDownload(file.url, file.name);
            }}
            className="p-1.5 rounded-md text-white/30 hover:text-[#E5C185] hover:bg-[#E5C185]/10 transition-all">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Thumbnail Content
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ThumbnailContent({ file, idx, isImageLoaded, onImageLoad }: {
  file: VaultFile; idx: number; isImageLoaded: boolean; onImageLoad: (i: number) => void;
}) {
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
      <div className="relative w-full h-full bg-[#07303F] flex flex-col items-center justify-center group overflow-hidden border border-white/5">

        {/* INJEKSI FRAME VIDEO (Detik 0.001) */}
        <video
          src={`${file.url}#t=0.001`}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity duration-500"
          preload="metadata"
          muted
          playsInline
        />

        {/* Lapisan Gradien Gelap: Mencegah ikon Play tertelan latar belakang video yang terang */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07303F]/90 via-[#07303F]/20 to-transparent pointer-events-none" />

        <PlayCircle className="w-10 h-10 text-white group-hover:text-[#E5C185] group-hover:scale-110 transition-all drop-shadow-2xl z-10" strokeWidth={1.5} />
        <span className="absolute bottom-2 right-2 text-[9px] font-bold tracking-widest text-white/90 bg-black/60 px-2 py-1 rounded backdrop-blur-md z-10 border border-white/10">
          VIDEO
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50">
      <FileIcon className="w-12 h-12 text-white/15" />
    </div>
  );
}