"use client";

import { useState } from "react";
import { 
  Folder, Image as ImageIcon, File, Trash2, Copy, 
  UploadCloud, ChevronRight, Search, Home, MoreVertical,
  RefreshCw, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ==========================================
// MOCK DATA: Struktur Objek R2 (Ganti dengan fetch dari lib/actions/explorer.ts Anda nanti)
// ==========================================
type R2Object = {
  id: string;
  name: string;
  type: 'folder' | 'image' | 'document';
  size?: string;
  lastModified?: string;
  url?: string;
};

const mockFiles: Record<string, R2Object[]> = {
  "root": [
    { id: "1", name: "templates", type: "folder", lastModified: "14 Mar 2026" },
    { id: "2", name: "system", type: "folder", lastModified: "10 Mar 2026" },
    { id: "3", name: "clients", type: "folder", lastModified: "12 Mar 2026" },
    { id: "4", name: "global-logo.png", type: "image", size: "245 KB", lastModified: "01 Mar 2026", url: "/logo/logo-gold.png" },
  ],
  "templates": [
    { id: "5", name: "thumbnails", type: "folder", lastModified: "14 Mar 2026" },
    { id: "6", name: "javanese-bg.jpg", type: "image", size: "1.2 MB", lastModified: "14 Mar 2026", url: "#" },
    { id: "7", name: "modern-font.ttf", type: "document", size: "800 KB", lastModified: "13 Mar 2026" },
  ],
  "templates/thumbnails": [
    { id: "8", name: "jvn-01.jpg", type: "image", size: "450 KB", lastModified: "14 Mar 2026", url: "#" },
    { id: "9", name: "mdn-02.jpg", type: "image", size: "520 KB", lastModified: "14 Mar 2026", url: "#" },
  ]
};

export default function AssetVaultPage() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // LOGIKA NAVIGASI
  const pathKey = currentPath.length === 0 ? "root" : currentPath.join("/");
  const currentFiles = mockFiles[pathKey] || [];

  const handleNavigate = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const handleBreadcrumb = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const goHome = () => setCurrentPath([]);

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
        
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <Button variant="outline" className="h-10 border-slate-200 text-slate-600 hover:text-[#07303F] hover:bg-slate-50 rounded-sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button className="h-10 bg-[#E5C185] text-[#07303F] hover:bg-[#d4b074] font-bold uppercase tracking-widest text-[10px] rounded-sm shadow-lg shadow-[#E5C185]/20">
            <UploadCloud className="w-4 h-4 mr-2" /> Upload Asset
          </Button>
        </div>
      </div>

      {/* EXPLORER INTERFACE (Desain ala Cloudflare/Vercel) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        
        {/* TOPBAR: Breadcrumbs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-slate-100 bg-[#F9F8F4]/50 gap-4">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center text-sm font-medium text-slate-600 overflow-x-auto w-full no-scrollbar">
            <button onClick={goHome} className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-[#07303F]">
              <Home className="w-4 h-4" />
            </button>
            <ChevronRight className="w-4 h-4 mx-1 text-slate-400 shrink-0" />
            
            <button onClick={goHome} className={`hover:text-[#07303F] transition-colors ${currentPath.length === 0 ? 'text-[#07303F] font-bold' : ''}`}>
              evory-bucket
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

          {/* Search Bar */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Cari aset..." 
              className="h-9 pl-9 bg-white border-slate-200 focus-visible:ring-[#E5C185] rounded-md text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* LIST FILES (TABLE VIEW) */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-6 py-4 font-bold w-1/2">Nama File / Folder</th>
                <th className="px-6 py-4 font-bold w-1/6">Ukuran</th>
                <th className="px-6 py-4 font-bold w-1/4">Terakhir Diubah</th>
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {currentFiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400">
                    <Folder className="w-12 h-12 mx-auto mb-4 opacity-20 text-[#07303F]" />
                    <p className="font-serif italic text-lg text-[#07303F]">Direktori Kosong.</p>
                    <p className="text-xs mt-1">Gunakan tombol Upload Asset di atas.</p>
                  </td>
                </tr>
              ) : (
                currentFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-[#F9F8F4] transition-colors group cursor-pointer" onDoubleClick={() => file.type === 'folder' ? handleNavigate(file.name) : null}>
                    
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {/* Ikon Dinamis berdasarkan Tipe File */}
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
                          <button className="p-1.5 text-slate-400 hover:text-[#07303F] hover:bg-slate-200 rounded transition-colors" title="Copy URL">
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* STATUS BAR BAWAH */}
        <div className="bg-[#F9F8F4] border-t border-slate-200 p-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex justify-between items-center">
          <span>{currentFiles.length} item(s)</span>
          <span>Sistem Penyimpanan Terenkripsi</span>
        </div>

      </div>
    </div>
  );
}