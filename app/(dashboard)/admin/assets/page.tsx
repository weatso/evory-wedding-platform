"use client";

import { useState, useEffect, useCallback } from "react";
import AssetUploader from "@/components/admin/AssetUploader"; 
import { listR2Files } from "@/lib/actions/explorer";
import { deleteFromR2 } from "@/lib/actions/delete";
import { toast } from "sonner";

interface R2FileObject {
  name: string;
  key: string;
  url: string;
  size: number;
  lastModified: string;
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<R2FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState<"template" | "client">("template");
  const [folderPath, setFolderPath] = useState("general"); 

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const res = await listR2Files(destination, folderPath);
    
    if (!res.success) {
      toast.error(res.error);
    } else {
      // Urutkan file terbaru di atas
      const sortedFiles = (res.files || []).sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
      setFiles(sortedFiles);
    }
    setLoading(false);
  }, [destination, folderPath]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL berhasil disalin ke clipboard!");
  };

  const handleDelete = async (fileKey: string, fileUrl: string) => {
    if (!confirm(`Yakin ingin memusnahkan aset ini dari R2? Tindakan ini tidak bisa dibatalkan.`)) return;
    
    // Tembak Server Action untuk hard-delete
    const res = await deleteFromR2(fileUrl, destination);
    
    if (!res.success) {
      toast.error(res.error);
    } else {
      toast.success("File fisik berhasil dihapus.");
      fetchFiles(); // Refresh
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-[#5D4037]">R2 Media Library</h1>
        <p className="text-gray-500 mb-8">Pusat kontrol CDN Cloudflare untuk Template & Aset.</p>

        {/* --- 1. AREA UPLOAD --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="font-bold text-lg mb-4">Upload ke CDN (Bypass Server)</h2>
          <div className="flex flex-col md:flex-row gap-6 items-start">
             <div className="flex-1 w-full">
                <AssetUploader 
                  destination={destination}
                  storagePath={folderPath} 
                  onUploadComplete={() => fetchFiles()} 
                />
             </div>
             <div className="w-full md:w-1/3 text-sm bg-slate-50 p-4 rounded border border-slate-200 text-slate-700">
                <strong>Pengaturan Infrastruktur:</strong>
                
                <div className="mt-4">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Target Bucket</label>
                   <select 
                     value={destination} 
                     onChange={(e) => setDestination(e.target.value as "template" | "client")}
                     className="block w-full p-2 rounded border border-slate-300 bg-white"
                   >
                     <option value="template">Templates (evory-templates)</option>
                     <option value="client">Clients (evory-clients)</option>
                   </select>
                </div>

                <div className="mt-4">
                   <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Struktur Folder</label>
                   <input 
                     type="text" 
                     value={folderPath}
                     onChange={(e) => setFolderPath(e.target.value)}
                     placeholder="contoh: javanese/jvn-01/backgrounds"
                     className="block w-full p-2 rounded border border-slate-300 bg-white font-mono text-xs"
                   />
                </div>
                
             </div>
          </div>
        </div>

        {/* --- 2. GALLERY LIST --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-bold text-lg">Daftar File ({files.length})</h2>
                <p className="text-xs text-slate-400 font-mono mt-1">/{destination}/{folderPath}</p>
              </div>
              <button onClick={fetchFiles} className="text-sm bg-slate-100 px-4 py-2 rounded hover:bg-slate-200 transition">
                Refresh CDN List
              </button>
           </div>

           {loading ? (
             <div className="text-center py-10 text-gray-400 animate-pulse">Memindai Cloudflare R2...</div>
           ) : files.length === 0 ? (
             <div className="text-center py-10 text-gray-400 bg-gray-50 rounded border border-dashed">
               Bucket/Folder ini kosong.
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((file) => {
                  const isImage = file.name.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
                  
                  return (
                    <div key={file.key} className="group relative border rounded-lg p-2 hover:border-slate-400 transition-colors bg-white">
                       <div className="aspect-square bg-slate-100 rounded overflow-hidden mb-2 relative flex items-center justify-center">
                          {isImage ? (
                            <img src={file.url} className="w-full h-full object-cover" alt={file.name} loading="lazy" />
                          ) : (
                            <span className="text-xs text-slate-500 font-mono uppercase break-all px-2 text-center">
                               {file.name.split('.').pop() || "FILE"}
                            </span>
                          )}
                       </div>

                       <p className="text-xs font-bold truncate mb-1 text-slate-700" title={file.name}>{file.name}</p>
                       <p className="text-[10px] text-slate-400 mb-3">{(file.size / 1024).toFixed(1)} KB</p>

                       <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => copyToClipboard(file.url)}
                            className="bg-slate-800 text-white text-xs py-1.5 rounded hover:bg-slate-700 transition"
                          >
                            Copy URL
                          </button>
                          <button 
                             onClick={() => handleDelete(file.key, file.url)}
                             className="text-red-500 text-[10px] hover:underline text-center mt-1 py-1"
                          >
                             Hard Delete
                          </button>
                       </div>
                    </div>
                  );
                })}
             </div>
           )}
        </div>

      </div>
    </div>
  );
}