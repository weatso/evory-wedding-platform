"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Folder, Image as ImageIcon, Trash2, Copy, 
  UploadCloud, ChevronRight, Search, Home,
  RefreshCw, FileText, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listR2Files } from "@/lib/actions/explorer";

type R2Object = {
  id: string;
  name: string;
  type: 'folder' | 'image' | 'document';
  size?: string;
  lastModified?: string;
  url?: string;
};

export default function AssetVaultPage() {
  const [destination, setDestination] = useState<"template" | "client">("template");
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [files, setFiles] = useState<R2Object[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ENGINE PENGAMBILAN DATA DARI R2
  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const folderPrefix = currentPath.length > 0 ? currentPath.join("/") : "";
      const res = await listR2Files(destination, folderPrefix);
      
      if (res.success) {
        setFiles(res.files || []);
      } else {
        setError(res.error || "Gagal memuat aset.");
      }
    } catch (err: any) {
      setError("Koneksi ke R2 Cloud terputus.");
    } finally {
      setIsLoading(false);
    }
  }, [destination, currentPath]);

  // Eksekusi Fetch setiap kali destinasi atau path berubah
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Reset path ke root jika bucket destination diubah
  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDestination(e.target.value as "template" | "client");
    setCurrentPath([]); 
  };

  const handleNavigate = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const handleBreadcrumb = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const goHome = () => setCurrentPath([]);

  // FILTER PENCARIAN LOKAL
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 lg:space-y-8 pb-20">
      
      {/* HEADER: KENDALI UTAMA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-6">
        <div>
          <Badge className="bg-[#07303F] text-[#E5C185] hover:bg-[#07303F] rounded-sm text-[10px] font-bold uppercase tracking-widest mb-3">
            R2 Cloud Storage
          </Badge>
          <h1 className="text-3xl md:text-4xl font-serif italic font-bold text-[#07303F] mb-1">
            Asset Vault
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
            Manajemen File Sistem & Media Klien
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0 items-center">
          
          {/* BUCKET SELECTOR (Opsi 2 yang Anda pilih) */}
          <div className="relative">
            <select 
              value={destination}
              onChange={handleDestinationChange}
              className="h-10 appearance-none bg-white border border-slate-200 text-[#07303F] text-xs font-bold uppercase tracking-widest pl-4 pr-10 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#E5C185] cursor-pointer"
            >
              <option value="template">Template Registry</option>
              <option value="client">Client Uploads</option>
            </select>
            <ChevronRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
          </div>

          <Button onClick={fetchAssets} variant="outline" className="h-10 border-slate-200 text-slate-600 hover:text-[#07303F] hover:bg-slate-50 rounded-sm">
            <RefreshCw className={`w-4 h-4 md:mr-2 ${isLoading ? "animate-spin" : ""}`} /> 
            <span className="hidden md:inline">Refresh</span>
          </Button>

          <Button className="h-10 bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] font-bold uppercase tracking-widest text-[10px] rounded-sm shadow-lg shadow-[#E5C185]/20">
            <UploadCloud className="w-4 h-4 mr-2" /> Upload Asset
          </Button>
        </div>
      </div>

      {/* EXPLORER INTERFACE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        
        {/* TOPBAR: Breadcrumbs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-slate-100 bg-[#F9F8F4]/50 gap-4">
          
          <div className="flex items-center text-sm font-medium text-slate-600 overflow-x-auto w-full no-scrollbar">
            <button onClick={goHome} className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-[#07303F]">
              <Home className="w-4 h-4" />
            </button>
            <ChevronRight className="w-4 h-4 mx-1 text-slate-400 shrink-0" />
            
            <button onClick={goHome} className={`hover:text-[#07303F] transition-colors ${currentPath.length === 0 ? 'text-[#07303F] font-bold' : ''}`}>
              {destination}-bucket
            </button>

            {currentPath.map((folder, idx) => (
              <div key={idx} className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-1 text-slate-400 shrink-0" />
                <button 
                  onClick={() => handleBreadcrumb(idx)}
                  className={`hover:text-[#07303F] transition-colors truncate max-w-[100px] sm:max-w-[200px] ${idx === currentPath.length - 1 ? 'text-[#07303F] font-bold' : ''}`}
                >
                  {folder}
                </button>
              </div>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Cari dalam direktori ini..." 
              className="h-9 pl-9 bg-white border-slate-200 focus-visible:ring-[#E5C185] rounded-md text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* LIST FILES (TABLE VIEW) */}
        <div className="flex-1 overflow-x-auto relative">
          
          {/* Overlay Loading */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#E5C185] mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest text-[#07303F]">Fetching Vault Data...</p>
            </div>
          )}

          {error && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
               <p className="font-bold">{error}</p>
               <p className="text-xs text-slate-500 mt-2">Pastikan kredensial Cloudflare R2 di .env sudah benar.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-white border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-bold w-1/2">Nama File / Folder</th>
                  <th className="px-6 py-4 font-bold w-1/6">Ukuran</th>
                  <th className="px-6 py-4 font-bold w-1/4">Terakhir Diubah</th>
                  <th className="px-6 py-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredFiles.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                      <Folder className="w-12 h-12 mx-auto mb-4 opacity-20 text-[#07303F]" />
                      <p className="font-serif italic text-lg text-[#07303F]">Direktori Kosong.</p>
                      <p className="text-xs mt-1">Tidak ada aset pada path ini.</p>
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-[#F9F8F4] transition-colors group cursor-pointer" onDoubleClick={() => file.type === 'folder' ? handleNavigate(file.name) : null}>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${file.type === 'folder' ? 'bg-[#07303F]/5 text-[#07303F]' : file.type === 'image' ? 'bg-[#E5C185]/20 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                            {file.type === 'folder' && <Folder className="w-5 h-5 fill-[#07303F]/20" />}
                            {file.type === 'image' && <ImageIcon className="w-5 h-5" />}
                            {file.type === 'document' && <FileText className="w-5 h-5" />}
                          </div>
                          
                          <div 
                            className={`font-medium transition-colors ${file.type === 'folder' ? 'text-[#07303F] group-hover:text-[#E5C185] hover:underline' : 'text-slate-700'}`}
                            onClick={() => file.type === 'folder' ? handleNavigate(file.name) : null}
                          >
                            {file.name}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-3 text-slate-500 text-xs">
                        {file.type === 'folder' ? '--' : file.size}
                      </td>

                      <td className="px-6 py-3 text-slate-500 text-xs">
                        {file.lastModified}
                      </td>

                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {file.type !== 'folder' && (
                            <button 
                              onClick={() => { navigator.clipboard.writeText(file.url || ""); alert("URL Disalin!"); }}
                              className="p-1.5 text-slate-400 hover:text-[#07303F] hover:bg-slate-200 rounded transition-colors" 
                              title="Copy Public URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Hapus Permanen">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* STATUS BAR BAWAH */}
        <div className="bg-[#F9F8F4] border-t border-slate-200 p-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex justify-between items-center">
          <span>{filteredFiles.length} item(s)</span>
          <span>Sistem Penyimpanan Terenkripsi (R2)</span>
        </div>

      </div>
    </div>
  );
}