"use client";

import { useState, useMemo } from "react";
import {
  Download, FileVideo, FileImage, File as FileIcon,
  Search, X, ChevronLeft, ChevronRight, Check,
  Eye, HardDrive, CheckSquare, Square, Play
} from "lucide-react";

export type VaultFile = {
  name: string;
  url: string;
  size: string;
  date: string;
  type: "video" | "image" | "document";
};

interface VaultClientProps {
  files: VaultFile[];
  eventName: string;
}

export default function VaultClient({ files, eventName }: VaultClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "image" | "video" | "document">("all");
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Filter & Search
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = activeFilter === "all" || file.type === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [files, searchQuery, activeFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: files.length,
    images: files.filter(f => f.type === "image").length,
    videos: files.filter(f => f.type === "video").length,
    documents: files.filter(f => f.type === "document").length,
  }), [files]);

  // Selection
  const toggleSelect = (idx: number) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map((_, i) => i)));
    }
  };

  const clearSelection = () => setSelectedFiles(new Set());

  // Batch Download
  const handleBatchDownload = () => {
    const filesToDownload = Array.from(selectedFiles).map(i => filteredFiles[i]);
    filesToDownload.forEach((file, idx) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = file.url;
        a.download = file.name;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, idx * 300);
    });
  };

  // Preview Navigation
  const openPreview = (idx: number) => setPreviewIndex(idx);
  const closePreview = () => setPreviewIndex(null);
  const prevPreview = () => {
    if (previewIndex !== null && previewIndex > 0) setPreviewIndex(previewIndex - 1);
  };
  const nextPreview = () => {
    if (previewIndex !== null && previewIndex < filteredFiles.length - 1) setPreviewIndex(previewIndex + 1);
  };

  const previewFile = previewIndex !== null ? filteredFiles[previewIndex] : null;

  const filterButtons: { key: typeof activeFilter; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: stats.total },
    { key: "image", label: "Foto", count: stats.images },
    { key: "video", label: "Video", count: stats.videos },
    { key: "document", label: "Dokumen", count: stats.documents },
  ];

  return (
    <div className="min-h-screen bg-[#07303F] text-[#F9F8F4] selection:bg-[#E5C185] selection:text-[#07303F]">
      {/* PREVIEW LIGHTBOX */}
      {previewFile && previewIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col" onClick={closePreview}>
          {/* Lightbox Header */}
          <div className="flex items-center justify-between p-4 md:p-6 shrink-0" onClick={e => e.stopPropagation()}>
            <div className="min-w-0 flex-1 mr-4">
              <p className="text-sm font-bold text-white truncate">{previewFile.name}</p>
              <p className="text-xs text-white/50 mt-0.5">{previewFile.size} • {previewFile.date}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={previewFile.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#E5C185] text-[#07303F] rounded-lg text-sm font-bold hover:bg-[#d4b074] transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </a>
              <button onClick={closePreview} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Content */}
          <div className="flex-1 flex items-center justify-center relative px-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Prev Arrow */}
            {previewIndex > 0 && (
              <button onClick={prevPreview} className="absolute left-2 md:left-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm">
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
            )}

            {/* Media Content */}
            <div className="max-w-5xl max-h-[75vh] flex items-center justify-center">
              {previewFile.type === "image" ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                />
              ) : previewFile.type === "video" ? (
                <video
                  src={previewFile.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[75vh] rounded-lg shadow-2xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-4 p-12 bg-white/5 rounded-2xl border border-white/10">
                  <FileIcon className="w-20 h-20 text-white/30" />
                  <p className="text-white/60 text-sm">Preview tidak tersedia untuk file ini</p>
                  <a
                    href={previewFile.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-[#E5C185] text-[#07303F] rounded-lg text-sm font-bold hover:bg-[#d4b074] transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download File
                  </a>
                </div>
              )}
            </div>

            {/* Next Arrow */}
            {previewIndex < filteredFiles.length - 1 && (
              <button onClick={nextPreview} className="absolute right-2 md:right-6 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm">
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Lightbox Counter */}
          <div className="p-4 text-center shrink-0">
            <span className="text-xs text-white/40 font-mono">{previewIndex + 1} / {filteredFiles.length}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-6xl mx-auto pt-12 md:pt-20 pb-8 px-4 md:px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[#E5C185]/10 border border-[#E5C185]/20 rounded-xl">
            <HardDrive className="w-5 h-5 text-[#E5C185]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E5C185]/80">
            Media Vault
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif italic font-bold mb-3">
          {eventName.replace(/-/g, " ")}
        </h1>
        <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
          Seluruh aset beresolusi tinggi tersedia di bawah ini. Pilih file untuk preview atau download.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mt-6">
          {[
            { icon: <FileImage className="w-3.5 h-3.5" />, label: "Foto", count: stats.images },
            { icon: <FileVideo className="w-3.5 h-3.5" />, label: "Video", count: stats.videos },
            { icon: <FileIcon className="w-3.5 h-3.5" />, label: "Dokumen", count: stats.documents },
          ].map(s => s.count > 0 && (
            <div key={s.label} className="flex items-center gap-2 text-xs text-white/50 bg-white/5 rounded-full px-3 py-1.5 border border-white/5">
              {s.icon}
              <span>{s.count} {s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
          {/* Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {filterButtons.map(fb => fb.count > 0 && (
              <button
                key={fb.key}
                onClick={() => { setActiveFilter(fb.key); clearSelection(); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeFilter === fb.key
                    ? "bg-[#E5C185] text-[#07303F] shadow-lg shadow-[#E5C185]/20"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {fb.label} <span className="ml-1 opacity-60">{fb.count}</span>
              </button>
            ))}
          </div>

          {/* Search + Select All */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={toggleSelectAll}
              className="p-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors shrink-0"
              title="Pilih semua"
            >
              {selectedFiles.size === filteredFiles.length && filteredFiles.length > 0
                ? <CheckSquare className="w-4 h-4 text-[#E5C185]" />
                : <Square className="w-4 h-4" />}
            </button>
            <div className="relative flex-1 sm:w-52">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Cari file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E5C185]/40 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FILE GRID */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-32">
        {filteredFiles.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-center">
            <HardDrive className="w-16 h-16 text-white/10 mb-4" />
            <p className="text-white/30 font-serif italic text-lg">
              {files.length === 0 ? "Belum ada aset yang diunggah." : "Tidak ada file ditemukan."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredFiles.map((file, idx) => {
              const isSelected = selectedFiles.has(idx);
              return (
                <div
                  key={idx}
                  className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "border-[#E5C185] ring-2 ring-[#E5C185]/30 scale-[0.98]"
                      : "border-white/[0.06] hover:border-white/20 hover:shadow-xl hover:shadow-black/20"
                  }`}
                >
                  {/* Thumbnail Area */}
                  <div
                    className="aspect-square relative bg-white/[0.03] overflow-hidden"
                    onClick={() => openPreview(idx)}
                  >
                    {file.type === "image" ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : file.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-[#E5C185] group-hover:border-[#E5C185] transition-all duration-300">
                          <Play className="w-6 h-6 text-white group-hover:text-[#07303F] ml-0.5 transition-colors" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                        <FileIcon className="w-12 h-12 text-white/15" />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 bg-white/10 backdrop-blur-sm rounded-full">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Checkbox */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(idx); }}
                      className={`absolute top-2 left-2 z-10 p-1.5 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? "bg-[#E5C185] text-[#07303F] shadow-lg"
                          : "bg-black/40 text-white/70 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md backdrop-blur-sm ${
                        file.type === "video"
                          ? "bg-blue-500/30 text-blue-200 border border-blue-400/20"
                          : file.type === "image"
                            ? "bg-pink-500/30 text-pink-200 border border-pink-400/20"
                            : "bg-slate-500/30 text-slate-200 border border-slate-400/20"
                      }`}>
                        {file.type === "video" ? "VID" : file.type === "image" ? "IMG" : "DOC"}
                      </span>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="p-3 bg-white/[0.02]">
                    <p className="text-xs font-medium text-white/80 truncate mb-1.5" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">{file.size}</span>
                      <a
                        href={file.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md text-white/30 hover:text-[#E5C185] hover:bg-[#E5C185]/10 transition-all"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FLOATING BATCH BAR */}
      {selectedFiles.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0a3d50] border border-[#E5C185]/20 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-black/40 flex items-center gap-4 backdrop-blur-xl">
          <span className="text-sm font-bold text-[#E5C185]">{selectedFiles.size}</span>
          <span className="text-sm text-white/60">file dipilih</span>
          <div className="w-px h-5 bg-white/10" />
          <button
            onClick={handleBatchDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[#E5C185] text-[#07303F] rounded-xl text-sm font-bold hover:bg-[#d4b074] transition-colors shadow-lg shadow-[#E5C185]/20"
          >
            <Download className="w-4 h-4" /> Download {selectedFiles.size > 1 ? `${selectedFiles.size} Files` : "File"}
          </button>
          <button
            onClick={clearSelection}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-8">
        <div className="border-t border-white/[0.06] pt-6 flex items-center justify-center gap-2 text-[10px] text-white/20 uppercase tracking-widest">
          <HardDrive className="w-3 h-3" />
          <span>Powered by Evory Media Vault</span>
        </div>
      </div>
    </div>
  );
}
